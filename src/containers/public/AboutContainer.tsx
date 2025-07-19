"use client";

import { Camera, Users, Award, Heart, Clock, MapPin } from "lucide-react";
import Link from "next/link";

export default function AboutContainer() {
  const teamMembers = [
    {
      name: "Ahmet Kaya",
      role: "Kurucu ve Baş Fotoğrafçı",
      experience: "12 yıl deneyim",
      image: "/images/team/photographer-1.jpg",
      description: "Düğün fotoğrafçılığında uzman, 500+ çift ile çalıştı.",
    },
    {
      name: "Zeynep Demir",
      role: "Kreatif Direktör",
      experience: "8 yıl deneyim",
      image: "/images/team/photographer-2.jpg",
      description: "Sanatsal portre çekimleri ve post-prodüksiyon uzmanı.",
    },
    {
      name: "Mehmet Özkan",
      role: "Etkinlik Fotoğrafçısı",
      experience: "6 yıl deneyim",
      image: "/images/team/photographer-3.jpg",
      description: "Kurumsal ve özel etkinlik fotoğrafçılığında deneyimli.",
    },
  ];

  const achievements = [
    {
      icon: Camera,
      number: "2000+",
      label: "Başarılı Çekim",
      description: "Çekilen projeler",
    },
    {
      icon: Users,
      number: "1500+",
      label: "Mutlu Müşteri",
      description: "Memnun kalınmış çiftler",
    },
    {
      icon: Award,
      number: "25+",
      label: "Ödül",
      description: "Sektör ödülleri",
    },
    {
      icon: Heart,
      number: "10+",
      label: "Yıl Deneyim",
      description: "Sektörde faaliyet",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
              Hikayenizi Birlikte
              <span className="text-purple-600 block">Ölümsüzleştirelim</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              10 yılı aşkın deneyimimizle, özel anlarınızı sanatsal bir bakış
              açısıyla fotoğraflıyor ve her karenin arkasında unutulmaz
              hikayeler yaratıyoruz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/portfolio"
                className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Portfolyomuzu İnceleyin
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                İletişime Geçin
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Hikayemiz</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  2014 yılında başlayan fotoğrafçılık yolculuğumuz, tutkuyla
                  başladı ve bugün profesyonel bir ekiple sürdürülüyor. İlk
                  kameramızı aldığımız günden bu yana, her çekimin arkasında bir
                  hikaye olduğuna inanıyor ve bu hikayeleri en güzel şekilde
                  anlatmaya odaklanıyoruz.
                </p>
                <p>
                  Düğün fotoğrafçılığından başlayarak, zamanla nişan çekimleri,
                  aile fotoğrafları ve kurumsal etkinlik çekimlerine kadar geniş
                  bir yelpazede hizmet vermeye başladık. Her projede
                  müşterilerimizin beklentilerini aşmayı hedefliyoruz.
                </p>
                <p>
                  Teknolojiyi yakından takip ediyor, modern ekipmanlar
                  kullanıyor ve sürekli kendimizi geliştiriyoruz. Amacımız, her
                  fotoğrafta duyguları yakalamak ve o anın enerjisini
                  ölümsüzleştirmek.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center">
                <Camera className="w-24 h-24 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              Başarılarımız
            </h2>
            <p className="text-gray-600">
              Yıllar içinde elde ettiğimiz deneyim ve başarılar
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <achievement.icon className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-black mb-2">
                  {achievement.number}
                </div>
                <div className="font-semibold text-gray-900 mb-1">
                  {achievement.label}
                </div>
                <div className="text-sm text-gray-600">
                  {achievement.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Ekibimiz</h2>
            <p className="text-gray-600">
              Deneyimli ve tutkulu fotoğrafçılarımızla tanışın
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl mb-6 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">
                  {member.name}
                </h3>
                <div className="text-purple-600 font-medium mb-2">
                  {member.role}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {member.experience}
                </div>
                <p className="text-gray-700 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Değerlerimiz</h2>
            <p className="text-gray-600">
              Çalışma felsefemizi şekillendiren temel ilkeler
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">
                Tutkulu Yaklaşım
              </h3>
              <p className="text-gray-700">
                Her projeye kalp koyuyoruz. Sizin özel gününüz bizim için de
                özel ve bu duyguları fotoğraflara yansıtmak için elimizden
                geleni yapıyoruz.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">
                Kalite Odaklı
              </h3>
              <p className="text-gray-700">
                En yüksek kalitede hizmet sunmak için sürekli kendimizi
                geliştiriyoruz. Modern ekipmanlar ve güncel teknikler
                kullanıyoruz.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">
                Zamanında Teslimat
              </h3>
              <p className="text-gray-700">
                Verdiğimiz sözleri tutarız. Belirlenen sürelerde teslimat yapar,
                müşterilerimizi bekletmeyiz.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">
                Müşteri Memnuniyeti
              </h3>
              <p className="text-gray-700">
                Müşteri memnuniyeti her şeyden önemli. Geri bildirimlerinizi
                dinliyor ve sürekli iyileştirme yapıyoruz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-6 text-white" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Hikayenizi Birlikte Yazalım
          </h2>
          <p className="text-purple-100 mb-8 text-lg">
            Özel gününüzü ölümsüzleştirmek için sizinle çalışmayı sabırsızlıkla
            bekliyoruz. Hemen iletişime geçin ve projemizi konuşalım.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Hemen Rezervasyon Yapın
            </Link>
            <Link
              href="/portfolio"
              className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Çalışmalarımızı İnceleyin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
