import { Metadata } from "next";
import FaqContainer from "@/containers/public/FaqContainer";
import { generateMetadata as genMeta, pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = genMeta({
  title: pageMetadata.faq.title,
  description: pageMetadata.faq.description,
  keywords: pageMetadata.faq.keywords,
  url: "/faq",
});

export default function FaqPage() {
  const faqData = [
    {
      q: "Fotoğraf çekimi fiyatları nasıl belirleniyor?",
      a: "Fiyatlarımız çekim türü, süre ve lokasyona göre değişmektedir. Düğün fotoğrafçılığı, nişan çekimi ve diğer özel etkinlikler için farklı paketlerimiz bulunmaktadır. Detaylı bilgi için bizimle iletişime geçebilirsiniz.",
    },
    {
      q: "Rezervasyon nasıl yapılır?",
      a: "Online rezervasyon formumuzu doldurarak veya telefon ile bizimle iletişime geçerek rezervasyon yapabilirsiniz. Rezervasyon için %30 kapora gerekmektedir.",
    },
    {
      q: "Düğün paketlerinizde neler var?",
      a: "Düğün paketlerimizde düğün öncesi ve sonrası çekimler, düğün günü tam gün çekim, düşük çözünürlüklü tüm fotoğraflar, yüksek çözünürlüklü seçili fotoğraflar ve özel düzenlemeler bulunmaktadır.",
    },
    {
      q: "Fotoğraflar ne zaman teslim edilir?",
      a: "Düğün fotoğrafları 2-3 hafta içinde, diğer etkinlik fotoğrafları ise 1-2 hafta içinde teslim edilmektedir. Acil durumlar için hızlı teslim seçeneği de mevcuttur.",
    },
    {
      q: "Hangi bölgelerde hizmet veriyorsunuz?",
      a: "Öncelikli olarak İstanbul ve çevre illerde hizmet vermekteyiz. Diğer şehirler için ulaşım ve konaklama masrafları ayrıca hesaplanmaktadır.",
    },
  ];

  // FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return <FaqContainer />;
}
