import type { NextApiRequest, NextApiResponse } from 'next';
import Iyzipay from "iyzipay";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BookingPaymentRequest {
  packageId: string;
  packageName: string;
  packagePrice: number;
  selectedAddOns?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  locationId?: string;
  locationName?: string;
  locationFee?: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  selectedDate: string;
  selectedTime: string;
  specialNotes?: string;
  callbackUrl: string;
}

interface IyzicoResponse {
  success: boolean;
  paymentPageUrl?: string;
  token?: string;
  conversationId?: string;
  error?: string;
  details?: any;
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<IyzicoResponse>
) {
  if (req.method === 'GET') {
    return res.status(200).json({ success: true });
  }

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
  const body: BookingPaymentRequest = req.body;
  const {
    packageName,
    packagePrice,
    selectedAddOns,
    locationName,
    locationFee,
    totalAmount,
    customerName,
    customerEmail,
    customerPhone,
    callbackUrl,
  } = body;

  // Validate required fields
  if (!packageName || !totalAmount || !customerName || !customerEmail || !customerPhone || !callbackUrl) {
    return res.status(400).json({ 
      success: false, 
      error: 'Gerekli alanlar eksik' 
    });
  }

  // Initialize Iyzipay
  const iyzipay = new Iyzipay({
    apiKey: iyzicoApiKey,
    secretKey: iyzicoSecretKey,
    uri: iyzicoBaseUrl,
  });

  // Generate conversation ID
  const conversationId = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  // Get client IP
  const forwarded = req.headers['x-forwarded-for'] as string;
  const realIP = req.headers['x-real-ip'] as string;
  const clientIP = forwarded ? forwarded.split(',')[0].trim() : (realIP || '127.0.0.1');

  // Generate basket items
  const basketItems = [];
  
  // Add main package
  basketItems.push({
    id: 'package',
    name: packageName,
    category1: 'Photography',
    category2: 'Package',
    itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
    price: packagePrice.toString(),
  });

  // Add selected add-ons
  if (selectedAddOns && selectedAddOns.length > 0) {
    selectedAddOns.forEach((addOn, index) => {
      basketItems.push({
        id: `addon-${index}`,
        name: addOn.name,
        category1: 'Photography',
        category2: 'AddOn',
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: addOn.price.toString(),
      });
    });
  }

  // Add location fee if exists
  if (locationFee && locationFee > 0 && locationName) {
    basketItems.push({
      id: 'location-fee',
      name: `${locationName} - Ek Ücret`,
      category1: 'Photography',
      category2: 'Location',
      itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
      price: locationFee.toString(),
    });
  }

  // Create payment request
  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId,
    price: totalAmount.toString(),
    paidPrice: totalAmount.toString(),
    currency: Iyzipay.CURRENCY.TRY,
    basketId: `basket-${conversationId}`,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl,
    enabledInstallments: ['1'],
    
    buyer: {
      id: `buyer-${Date.now()}`,
      name: customerName.split(' ')[0] || 'Ad',
      surname: customerName.split(' ').slice(1).join(' ') || 'Soyad',
      gsmNumber: customerPhone.startsWith('+90') ? customerPhone : `+90${customerPhone.replace(/^0/, '')}`,
      email: customerEmail,
      identityNumber: '11111111111', // İyzico test ortamı için geçerli TC
      lastLoginDate: new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ''),
      registrationDate: new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ''),
      registrationAddress: 'Test Adres, İstanbul, Türkiye',
      ip: clientIP,
      city: 'İstanbul',
      country: 'Turkey',
      zipCode: '34732',
    },
    shippingAddress: {
      contactName: customerName,
      city: 'İstanbul',
      country: 'Turkey',
      address: 'Test Adres, İstanbul, Türkiye',
      zipCode: '34732',
    },
    billingAddress: {
      contactName: customerName,
      city: 'İstanbul',
      country: 'Turkey',
      address: 'Test Adres, İstanbul, Türkiye',
      zipCode: '34732',
    },
    basketItems,
  };

  try {
    const checkoutResult = await new Promise<{ 
      status: string; 
      errorMessage?: string; 
      paymentPageUrl?: string;
      token?: string;
    }>((resolve, reject) => {
      iyzipay.checkoutFormInitialize.create(request as any, (err: unknown, result: unknown) => {
        if (err) {
          console.error('İyzico initialization error:', err);
          return reject(err);
        }
        resolve(result as any);
      });
    });

    if (checkoutResult.status !== "success") {
      console.error('İyzico response error:', checkoutResult);
      return res.status(400).json({ 
        success: false,
        error: checkoutResult.errorMessage || "Ödeme başlatılamadı",
        details: checkoutResult
      });
    }

    return res.status(200).json({ 
      success: true,
      paymentPageUrl: checkoutResult.paymentPageUrl,
      token: checkoutResult.token,
      conversationId,
    });
  } catch (error: any) {
    console.error('İyzico API error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Sunucu hatası' 
    });
  } finally {
    await prisma.$disconnect();
  }
}