import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PaymentStatusResponse {
  success: boolean;
  payment?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    gatewayPaymentId?: string;
    createdAt: Date;
    booking?: {
      id: string;
      bookingCode: string;
      status: string;
      paymentStatus: string;
    };
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentStatusResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { paymentId, token } = req.query;

  if (!paymentId && !token) {
    return res.status(400).json({ 
      success: false, 
      error: 'Payment ID veya token gerekli' 
    });
  }

  try {
    let payment;

    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId as string },
        include: {
          booking: {
            select: {
              id: true,
              bookingCode: true,
              status: true,
              paymentStatus: true,
            }
          }
        }
      });
    } else if (token) {
      // Token ile payment ara (gatewayPaymentId olarak saklanıyor olabilir)
      payment = await prisma.payment.findFirst({
        where: { gatewayPaymentId: token as string },
        include: {
          booking: {
            select: {
              id: true,
              bookingCode: true,
              status: true,
              paymentStatus: true,
            }
          }
        }
      });
    }

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Ödeme bulunamadı' 
      });
    }

    return res.status(200).json({ 
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount.toNumber(),
        currency: payment.currency,
        gatewayPaymentId: payment.gatewayPaymentId || undefined,
        createdAt: payment.createdAt,
        booking: payment.booking,
      }
    });
  } catch (error: any) {
    console.error('Payment status check error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Sunucu hatası'
    });
  }
}
