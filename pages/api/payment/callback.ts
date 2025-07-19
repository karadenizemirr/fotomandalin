import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // İyzico callback'den gelen token'ı al
    const { token, conversationId, status } = req.body;

    if (!token) {
      // Token yoksa payment failed sayfasına yönlendir
      const failedHtml = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Ödeme Başarısız - Yönlendiriliyor...</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
          <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;">
            <div style="text-align: center; max-width: 400px; width: 100%;">
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 48px 32px; margin-bottom: 24px;">
                <!-- Error Icon -->
                <div style="margin: 0 auto 24px; width: 64px; height: 64px; background-color: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="#ef4444"/>
                    <path d="M15 9L9 15M9 9L15 15" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                
                <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #000000; line-height: 1.4;">
                  Ödeme Başarısız
                </h1>
                
                <p style="margin: 0 0 32px; font-size: 16px; color: #6b7280; line-height: 1.6;">
                  Ödeme işleminiz tamamlanamadı. Lütfen tekrar deneyiniz.
                </p>
                
                <!-- Loading Animation -->
                <div style="margin: 24px 0;">
                  <div style="display: inline-block; width: 32px; height: 32px; border: 3px solid #f3f4f6; border-top: 3px solid #ef4444; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>
                
                <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                  Yönlendiriliyor...
                </p>
              </div>
            </div>
          </div>
          
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            body > div {
              animation: fadeIn 0.5s ease-out;
            }
          </style>
          
          <script>
            setTimeout(() => {
              window.location.href = "/payment/failed";
            }, 2000);
          </script>
          <noscript>
            <meta http-equiv="refresh" content="3; url=/payment/failed">
          </noscript>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(failedHtml);
    }

    // Payment success sayfasına yönlendirme için HTML oluştur
    const successUrl = `/payment/success?token=${encodeURIComponent(token)}${
      conversationId ? `&conversationId=${encodeURIComponent(conversationId)}` : ''
    }`;

    const successHtml = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Ödeme Başarılı - Yönlendiriliyor...</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;">
          <div style="text-align: center; max-width: 400px; width: 100%;">
            <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 48px 32px; margin-bottom: 24px;">
              <!-- Success Icon -->
              <div style="margin: 0 auto 24px; width: 64px; height: 64px; background-color: #f0fdf4; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="#22c55e"/>
                  <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #000000; line-height: 1.4;">
                Ödeme Başarılı!
              </h1>
              
              <p style="margin: 0 0 32px; font-size: 16px; color: #6b7280; line-height: 1.6;">
                Ödemeniz başarıyla tamamlandı. Rezervasyon detaylarınıza yönlendiriliyorsunuz.
              </p>
              
              <!-- Loading Animation -->
              <div style="margin: 24px 0;">
                <div style="display: inline-block; width: 32px; height: 32px; border: 3px solid #f3f4f6; border-top: 3px solid #fca311; border-radius: 50%; animation: spin 1s linear infinite;"></div>
              </div>
              
              <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                Yönlendiriliyor...
              </p>
            </div>
          </div>
        </div>
        
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          body > div {
            animation: fadeIn 0.5s ease-out;
          }
          svg {
            animation: fadeIn 0.8s ease-out 0.2s both;
          }
        </style>
        
        <script>
          setTimeout(() => {
            window.location.href = "${successUrl}";
          }, 2000);
        </script>
        <noscript>
          <meta http-equiv="refresh" content="3; url=${successUrl}">
        </noscript>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(successHtml);

  } catch (error: any) {
    console.error('Callback processing error:', error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Ödeme Hatası - Yönlendiriliyor...</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;">
          <div style="text-align: center; max-width: 400px; width: 100%;">
            <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 48px 32px; margin-bottom: 24px;">
              <!-- Warning Icon -->
              <div style="margin: 0 auto 24px; width: 64px; height: 64px; background-color: #fffbeb; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L22 20H2L12 2Z" fill="#fca311"/>
                  <path d="M12 8V12M12 16H12.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #000000; line-height: 1.4;">
                Beklenmeyen Hata
              </h1>
              
              <p style="margin: 0 0 32px; font-size: 16px; color: #6b7280; line-height: 1.6;">
                Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyiniz.
              </p>
              
              <!-- Loading Animation -->
              <div style="margin: 24px 0;">
                <div style="display: inline-block; width: 32px; height: 32px; border: 3px solid #f3f4f6; border-top: 3px solid #fca311; border-radius: 50%; animation: spin 1s linear infinite;"></div>
              </div>
              
              <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                Yönlendiriliyor...
              </p>
            </div>
          </div>
        </div>
        
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          body > div {
            animation: fadeIn 0.5s ease-out;
          }
        </style>
        
        <script>
          setTimeout(() => {
            window.location.href = "/payment/failed";
          }, 2000);
        </script>
        <noscript>
          <meta http-equiv="refresh" content="3; url=/payment/failed">
        </noscript>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(errorHtml);
  }
}
