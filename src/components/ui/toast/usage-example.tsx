"use client";

import { ToastProvider, useToast, Toast } from './index';

// Örnek 1: useToast hook kullanımı
export function ToastExample() {
  const { addToast } = useToast();
  
  const showSuccessToast = () => {
    addToast({
      type: "success",
      title: "İşlem Başarılı",
      message: "Kaydınız başarıyla oluşturuldu.",
      duration: 5000, // 5 saniye
    });
  };
  
  const showErrorToast = () => {
    addToast({
      type: "error",
      title: "Hata",
      message: "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      duration: 7000, // 7 saniye
    });
  };
  
  const showInfoToast = () => {
    addToast({
      type: "info",
      message: "Yeni bir güncelleme mevcut.",
    });
  };
  
  const showWarningToast = () => {
    addToast({
      type: "warning",
      title: "Uyarı",
      message: "Bu işlem geri alınamaz.",
    });
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Toast Örnekleri</h2>
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={showSuccessToast}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Başarı Toast
        </button>
        <button 
          onClick={showErrorToast}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Hata Toast
        </button>
        <button 
          onClick={showInfoToast}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Bilgi Toast
        </button>
        <button 
          onClick={showWarningToast}
          className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
        >
          Uyarı Toast
        </button>
      </div>
    </div>
  );
}

// Örnek 2: Toast doğrudan kullanımı
export function DirectToastExample() {
  const handleSuccess = () => {
    Toast.success("İşlem başarıyla tamamlandı.", { title: "Başarılı" });
  };
  
  const handleError = () => {
    Toast.error("Bir hata oluştu.", { title: "Hata" });
  };
  
  const handleInfo = () => {
    Toast.info("Bilgilendirme mesajı");
  };
  
  const handleWarning = () => {
    Toast.warning("Dikkat edilmesi gereken bir durum var.", { title: "Uyarı" });
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Doğrudan Toast Kullanımı</h2>
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={handleSuccess}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Başarı
        </button>
        <button 
          onClick={handleError}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Hata
        </button>
        <button 
          onClick={handleInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Bilgi
        </button>
        <button 
          onClick={handleWarning}
          className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
        >
          Uyarı
        </button>
      </div>
    </div>
  );
}

// Ana uygulama içinde kullanım örneği
export default function ToastUsageExample() {
  return (
    <ToastProvider position="top-right">
      <div className="p-8 space-y-8">
        <ToastExample />
        <DirectToastExample />
      </div>
    </ToastProvider>
  );
}