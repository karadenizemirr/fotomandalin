import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface WebhookResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebhookResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const webhookData = req.body;
    
    // İyzico webhook signature verification burada yapılabilir
    // const isValidSignature = verifyWebhookSignature(req.headers, req.body);
    // if (!isValidSignature) {
    //   return res.status(401).json({ success: false, error: 'Invalid signature' });
    // }

    console.log('Received İyzico webhook:', webhookData);

    // Webhook eventini işle
    const { eventType, paymentId, status, conversationId } = webhookData;

    if (eventType === 'payment.success' && paymentId) {
      // Payment başarılı olduğunda veritabanını güncelle
      try {
        await prisma.payment.updateMany({
          where: {
            gatewayPaymentId: paymentId
          },
          data: {
            status: 'PAID',
            updatedAt: new Date()
          }
        });

        // İlgili booking'in payment status'unu güncelle
        const payment = await prisma.payment.findFirst({
          where: { gatewayPaymentId: paymentId },
          include: { booking: true }
        });

        if (payment?.booking) {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { paymentStatus: 'PAID' }
          });
        }

        console.log(`Payment ${paymentId} marked as PAID`);
      } catch (dbError) {
        console.error('Database update error:', dbError);
      }
    } else if (eventType === 'payment.failed' && paymentId) {
      // Payment başarısız olduğunda
      try {
        await prisma.payment.updateMany({
          where: {
            gatewayPaymentId: paymentId
          },
          data: {
            status: 'FAILED',
            updatedAt: new Date()
          }
        });

        console.log(`Payment ${paymentId} marked as FAILED`);
      } catch (dbError) {
        console.error('Database update error:', dbError);
      }
    }

    return res.status(200).json({ 
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Webhook processing failed'
    });
  }
}
