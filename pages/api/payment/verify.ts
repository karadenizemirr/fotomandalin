import type { NextApiRequest, NextApiResponse } from 'next';
import Iyzipay from "iyzipay";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VerifyPaymentRequest {
  token: string;
  conversationId?: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  status?: string;
  paymentStatus?: string;
  paymentId?: string;
  price?: number;
  paidPrice?: number;
  currency?: string;
  installment?: string;
  basketId?: string;
  conversationId?: string;
  error?: string;
  details?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyPaymentResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Get Iyzico settings from database
  let iyzicoApiKey: string;
  let iyzicoSecretKey: string; 
  let iyzicoBaseUrl: string;

  try {
    const paymentIntegration = await prisma.paymentIntegration.findFirst({
      where: {
        provider: 'iyzico',
        isActive: true,
      },
    });

    if (!paymentIntegration) {
      return res.status(500).json({ 
        success: false, 
        error: 'İyzico ödeme entegrasyonu bulunamadı veya aktif değil.' 
      });
    }

    if (!paymentIntegration.iyzicoApiKey || !paymentIntegration.iyzicoSecretKey || !paymentIntegration.iyzicoBaseUrl) {
      return res.status(500).json({ 
        success: false, 
        error: 'İyzico API anahtarları eksik. Lütfen ayarları kontrol edin.' 
      });
    }

    iyzicoApiKey = paymentIntegration.iyzicoApiKey;
    iyzicoSecretKey = paymentIntegration.iyzicoSecretKey;
    iyzicoBaseUrl = paymentIntegration.iyzicoBaseUrl;

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Veritabanı hatası. Lütfen daha sonra tekrar deneyin.' 
    });
  }

  // Parse request body
  const { token, conversationId }: VerifyPaymentRequest = req.body;

  if (!token) {
    return res.status(400).json({ 
      success: false, 
      error: 'Token gerekli' 
    });
  }

  // Initialize Iyzipay
  const iyzipay = new Iyzipay({
    apiKey: iyzicoApiKey,
    secretKey: iyzicoSecretKey,
    uri: iyzicoBaseUrl,
  });

  try {
    // Retrieve checkout form result
    const retrieveRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId || `verify-${Date.now()}`,
      token,
    };

    const retrieveResult = await new Promise<any>((resolve, reject) => {
      iyzipay.checkoutForm.retrieve(retrieveRequest, (err: any, result: any) => {
        if (err) {
          console.error('İyzico retrieve error:', err);
          return reject(err);
        }
        resolve(result);
      });
    });

    if (retrieveResult.status !== "success") {
      console.error('İyzico retrieve response error:', retrieveResult);
      return res.status(400).json({ 
        success: false,
        error: retrieveResult.errorMessage || "Ödeme doğrulanamadı",
        details: retrieveResult
      });
    }

    // Extract payment information
    const payment = retrieveResult;
    
    return res.status(200).json({ 
      success: true,
      status: payment.status,
      paymentStatus: payment.paymentStatus,
      paymentId: payment.paymentId,
      price: parseFloat(payment.price || '0'),
      paidPrice: parseFloat(payment.paidPrice || '0'),
      currency: payment.currency,
      installment: payment.installment,
      basketId: payment.basketId,
      conversationId: payment.conversationId,
    });
  } catch (error: any) {
    console.error('İyzico verify API error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Sunucu hatası' 
    });
  } finally {
    await prisma.$disconnect();
  }
}