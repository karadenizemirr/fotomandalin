import { z } from "zod";
import { router, publicProcedure } from "../index";
import { TRPCError } from "@trpc/server";
import { Decimal } from "@prisma/client/runtime/library";

// Helper function to get base URL
function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return 'http://localhost:3000';
}

export const paymentRouter = router({
  // İyzico Payment Endpoints - Using dedicated API route
  initiateIyzicoPayment: publicProcedure
    .input(z.object({
      // Booking data
      packageId: z.string(),
      packageName: z.string(),
      packagePrice: z.number(),
      selectedAddOns: z.array(z.object({
        id: z.string(),
        name: z.string(),
        price: z.number()
      })).optional(),
      locationId: z.string().optional(),
      locationName: z.string().optional(),
      locationFee: z.number().optional(),
      totalAmount: z.number(),
      // Customer data
      customerName: z.string(),
      customerEmail: z.string(),
      customerPhone: z.string(),
      // Booking details
      selectedDate: z.string(),
      selectedTime: z.string(),
      specialNotes: z.string().optional(),
      // Callback URLs
      callbackUrl: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Use the dedicated İyzico API endpoint
        const baseUrl = getBaseUrl();
        const apiUrl = `${baseUrl}/api/payment/iyzico`;
        
        // Call our dedicated İyzico API endpoint
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            packageId: input.packageId,
            packageName: input.packageName,
            packagePrice: input.packagePrice,
            selectedAddOns: input.selectedAddOns,
            locationId: input.locationId,
            locationName: input.locationName,
            locationFee: input.locationFee,
            totalAmount: input.totalAmount,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            selectedDate: input.selectedDate,
            selectedTime: input.selectedTime,
            specialNotes: input.specialNotes,
            callbackUrl: input.callbackUrl,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `API call failed: ${response.status} - ${errorText}`,
          });
        }

        const paymentResponse = await response.json();

        if (!paymentResponse.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: paymentResponse.error || 'Ödeme başlatılamadı',
          });
        }

        return paymentResponse;
      } catch (error: unknown) {
        console.error('İyzico payment initialization error:', error);
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Ödeme başlatılırken bir hata oluştu',
        });
      }
    }),

  verifyIyzicoPayment: publicProcedure
    .input(z.object({
      token: z.string(),
      conversationId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Use the dedicated verify API endpoint
        const baseUrl = getBaseUrl();
        const verifyUrl = `${baseUrl}/api/payment/verify`;
        
        const response = await fetch(verifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: input.token,
            conversationId: input.conversationId,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Verification failed: ${response.status} - ${errorText}`,
          });
        }

        const verifyResponse = await response.json();

        if (!verifyResponse.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: verifyResponse.error || 'Ödeme doğrulanamadı',
          });
        }

        return {
          success: true,
          status: verifyResponse.status,
          paymentStatus: verifyResponse.paymentStatus,
          token: input.token,
          conversationId: input.conversationId,
          paymentId: verifyResponse.paymentId,
          price: verifyResponse.price,
          paidPrice: verifyResponse.paidPrice,
        };
      } catch (error: unknown) {
        console.error('İyzico payment verification error:', error);
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Ödeme doğrulanırken bir hata oluştu',
        });
      }
    }),

  createBookingFromPayment: publicProcedure
    .input(z.object({
      paymentToken: z.string(),
      // Booking data from localStorage
      packageId: z.string(),
      selectedDate: z.string(),
      selectedTime: z.string(),
      locationId: z.string(),
      staffId: z.string().optional(),
      customerName: z.string(),
      customerEmail: z.string(),
      customerPhone: z.string(),
      specialNotes: z.string().optional(),
      selectedAddOns: z.array(z.string()).optional(),
      totalAmount: z.number(),
      userId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First verify the payment with İyzico
        const baseUrl = getBaseUrl();
        const verifyResult = await fetch(`${baseUrl}/api/payment/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: input.paymentToken }),
        }).then(res => res.json());

        if (!verifyResult.success || verifyResult.paymentStatus !== 'SUCCESS') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Ödeme doğrulanamadı veya başarısız',
          });
        }

        // Calculate duration
        let totalDurationMinutes = 240; // Default 4 hours
        
        // Get package duration and info
        const packageData = await ctx.prisma.package.findUnique({
          where: { id: input.packageId }
        });
        
        if (packageData) {
          totalDurationMinutes = packageData.durationInMinutes || 240;
        }

        // Get location info
        const locationData = input.locationId ? await ctx.prisma.location.findUnique({
          where: { id: input.locationId }
        }) : null;

        // Add add-on durations
        if (input.selectedAddOns && input.selectedAddOns.length > 0) {
          const addOns = await ctx.prisma.addOn.findMany({
            where: { id: { in: input.selectedAddOns } }
          });
          
          addOns.forEach((addOn: any) => {
            totalDurationMinutes += addOn.durationInMinutes || 30;
          });
        }

        // Calculate end time
        const startDateTime = new Date(`${input.selectedDate}T${input.selectedTime}:00`);
        const endDateTime = new Date(startDateTime.getTime() + totalDurationMinutes * 60 * 1000);

        // Generate booking code
        const bookingCode = `BK-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

        // Create booking
        const booking = await ctx.prisma.booking.create({
          data: {
            bookingCode,
            packageId: input.packageId,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            startTime: startDateTime,
            endTime: endDateTime,
            totalAmount: new Decimal(input.totalAmount),
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            locationId: input.locationId,
            staffId: input.staffId,
            specialNotes: input.specialNotes,
            userId: input.userId,
          }
        });

        // Create add-on relationships
        if (input.selectedAddOns && input.selectedAddOns.length > 0) {
          console.log('Creating add-ons for booking:', booking.id, 'Add-ons:', input.selectedAddOns);
          
          // Get add-on prices
          const addOns = await ctx.prisma.addOn.findMany({
            where: { id: { in: input.selectedAddOns } }
          });

          console.log('Found add-ons from database:', addOns);

          const addOnData = input.selectedAddOns.map(addOnId => {
            const addOn = addOns.find((a: any) => a.id === addOnId);
            console.log(`Mapping add-on ${addOnId}:`, addOn);
            return {
              bookingId: booking.id,
              addOnId,
              quantity: 1,
              price: addOn?.price || new Decimal(0),
            };
          });

          console.log('Add-on data to be created:', addOnData);

          const createdAddOns = await ctx.prisma.bookingAddOn.createMany({
            data: addOnData
          });

          console.log('Created add-ons result:', createdAddOns);
        } else {
          console.log('No add-ons to create for booking:', booking.id);
        }

        // Create payment record
        await ctx.prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: new Decimal(input.totalAmount),
            currency: 'TRY',
            method: 'CREDIT_CARD',
            status: 'PAID',
            gatewayPaymentId: verifyResult.paymentId,
          }
        });

        // Create booking timeline entries
        console.log('Creating booking timeline for booking:', booking.id);
        
        const timelineEntries = await ctx.prisma.bookingTimeline.createMany({
          data: [
            {
              bookingId: booking.id,
              action: 'CREATED',
              description: 'Rezervasyon oluşturuldu',
              metadata: {
                packageId: input.packageId,
                totalAmount: input.totalAmount,
                customerName: input.customerName,
                createdAt: new Date().toISOString(),
              }
            },
            {
              bookingId: booking.id,
              action: 'PAYMENT_RECEIVED',
              description: 'Ödeme başarıyla alındı',
              metadata: {
                paymentId: verifyResult.paymentId,
                amount: input.totalAmount,
                currency: 'TRY',
                method: 'CREDIT_CARD',
                gateway: 'İyzico',
              }
            },
            {
              bookingId: booking.id,
              action: 'CONFIRMED',
              description: 'Rezervasyon onaylandı',
              metadata: {
                confirmedAt: new Date().toISOString(),
                status: 'CONFIRMED',
                paymentStatus: 'PAID',
              }
            }
          ]
        });

        console.log('Created timeline entries result:', timelineEntries);

        // Send booking confirmation email
        try {
          const emailResult = await fetch(`${baseUrl}/api/email/booking-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: input.customerEmail,
              customerName: input.customerName,
              bookingId: booking.id,
              serviceName: packageData?.name || 'Fotoğraf Çekimi',
              date: new Date(input.selectedDate).toLocaleDateString('tr-TR'),
              time: input.selectedTime,
              location: locationData?.name || 'Belirtilmemiş',
              totalAmount: input.totalAmount,
            }),
          });
          
          if (emailResult.ok) {
            console.log('Booking confirmation email sent successfully');
          } else {
            console.error('Failed to send booking confirmation email:', await emailResult.text());
          }
        } catch (emailError) {
          console.error('Error sending booking confirmation email:', emailError);
          // Email hatası rezervasyon oluşturma işlemini durdurmaz
        }

        // Send payment confirmation email
        try {
          const paymentEmailResult = await fetch(`${baseUrl}/api/email/payment-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: input.customerEmail,
              customerName: input.customerName,
              bookingId: booking.id,
              amount: input.totalAmount,
              paymentMethod: 'Kredi Kartı',
              transactionId: verifyResult.paymentId,
            }),
          });
          
          if (paymentEmailResult.ok) {
            console.log('Payment confirmation email sent successfully');
          } else {
            console.error('Failed to send payment confirmation email:', await paymentEmailResult.text());
          }
        } catch (emailError) {
          console.error('Error sending payment confirmation email:', emailError);
          // Email hatası rezervasyon oluşturma işlemini durdurmaz
        }

        // Clear localStorage data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pendingBookingData');
        }

        return {
          success: true,
          bookingId: booking.id,
          booking,
        };
      } catch (error: unknown) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Rezervasyon oluşturulurken bir hata oluştu',
        });
      }
    }),

  // Get payment status
  getPaymentStatus: publicProcedure
    .input(z.object({
      paymentId: z.string().optional(),
      token: z.string().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const { paymentId, token } = input;
        
        if (!paymentId && !token) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Payment ID veya token gerekli',
          });
        }

        const baseUrl = getBaseUrl();
        const statusUrl = `${baseUrl}/api/payment/status`;
        
        const params = new URLSearchParams();
        if (paymentId) params.append('paymentId', paymentId);
        if (token) params.append('token', token);

        const response = await fetch(`${statusUrl}?${params.toString()}`);
        
        if (!response.ok) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Payment status alınamadı',
          });
        }

        const statusData = await response.json();
        return statusData;
      } catch (error: unknown) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Payment status kontrolü başarısız',
        });
      }
    }),
});
