"use client";

import { motion } from "framer-motion";
import {
  Star,
  User,
  Calendar,
  Camera,
  Heart,
  MessageCircle,
  ThumbsUp,
  Award,
  Verified,
  Quote,
  Filter,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface Review {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  date: string;
  service: string;
  comment: string;
  images?: string[];
  verified: boolean;
  likes: number;
  isLiked: boolean;
  location?: string;
}

interface CommentsProps {
  reviews?: Review[];
  showFilter?: boolean;
  showSort?: boolean;
  allowInteraction?: boolean;
}

export default function CommentsComponent({
  reviews: propReviews,
  showFilter = true,
  showSort = true,
  allowInteraction = true,
}: CommentsProps) {
  const [sortBy, setSortBy] = useState<"date" | "rating" | "likes">("date");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Default reviews data for demonstration
  const defaultReviews: Review[] = [
    {
      id: "1",
      name: "Ayşe Demir",
      rating: 5,
      date: "2025-07-15",
      service: "Düğün Fotoğrafçılığı",
      comment:
        "Düğünümüzde çekilen fotoğraflar harikaydı! Mehmet Bey ve ekibi çok profesyonel, her anımızı mükemmel bir şekilde ölümsüzleştirdiler. Fotoğrafları gören herkes hayran kaldı. Kesinlikle tavsiye ederim!",
      verified: true,
      likes: 24,
      isLiked: false,
      location: "İstanbul",
      images: ["/api/placeholder/300/200", "/api/placeholder/300/200"],
    },
    {
      id: "2",
      name: "Mehmet Kaya",
      rating: 5,
      date: "2025-07-10",
      service: "Aile Fotoğrafları",
      comment:
        "Aile fotoğraf çekimi için Fotomandalin'i tercih ettik ve çok memnun kaldık. Çocuklarımızla bile çok sabırlı davrandılar. Sonuçlar muhteşemdi!",
      verified: true,
      likes: 18,
      isLiked: true,
      location: "Ankara",
    },
    {
      id: "3",
      name: "Zeynep Yılmaz",
      rating: 4,
      date: "2025-07-08",
      service: "Nişan Çekimi",
      comment:
        "Nişan çekimimiz için harika bir deneyimdi. Fotoğrafçı çok yaratıcı ve pozlar gerçekten güzeldi. Tek eksik belki biraz daha fazla fotoğraf olabilirdi.",
      verified: false,
      likes: 12,
      isLiked: false,
      location: "İzmir",
    },
    {
      id: "4",
      name: "Can Özkan",
      rating: 5,
      date: "2025-07-05",
      service: "Portre Çekimi",
      comment:
        "Profesyonel portre çekimi yaptırdım, sonuç beklediğimden çok daha iyiydi. Işık kullanımı ve kompozisyon mükemmeldi. Herkese tavsiye ederim.",
      verified: true,
      likes: 31,
      isLiked: false,
      location: "Bursa",
    },
    {
      id: "5",
      name: "Elif Çelik",
      rating: 5,
      date: "2025-07-01",
      service: "Bebek Fotoğrafları",
      comment:
        "Bebeğimizin ilk fotoğraf çekimi için çok endişeliydik ama ekip o kadar sabırlı ve deneyimliydi ki. Bebeğimiz rahat etti ve çok güzel kareler çıktı. Teşekkürler!",
      verified: true,
      likes: 27,
      isLiked: false,
      location: "Antalya",
      images: ["/api/placeholder/300/200"],
    },
  ];

  const reviews = propReviews || defaultReviews;

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter((review) => {
      const matchesRating = filterRating
        ? review.rating === filterRating
        : true;
      const matchesSearch =
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.service.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRating && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "likes":
          comparison = a.likes - b.likes;
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

  // Calculate statistics
  const totalReviews = reviews.length;
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
    percentage:
      (reviews.filter((review) => review.rating === rating).length /
        totalReviews) *
      100,
  }));

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="py-12">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-10"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Müşteri Yorumları
          </motion.h2>
          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center gap-4"
          >
            <div className="text-2xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </div>
            {renderStars(Math.round(averageRating))}
            <span className="text-gray-600">
              ({totalReviews} değerlendirme)
            </span>
          </motion.div>
        </motion.div>

        {/* Simple Search */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-8"
        >
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Yorumlarda ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* Reviews Masonry Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4"
        >
          {filteredAndSortedReviews.map((review) => (
            <motion.div
              key={review.id}
              variants={fadeInUp}
              className="break-inside-avoid bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 mb-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900 text-xs">
                        {review.name}
                      </h4>
                      {review.verified && (
                        <Verified className="w-3 h-3 text-blue-500 ml-1" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {review.service}
                    </div>
                  </div>
                </div>
                {renderStars(review.rating, "sm")}
              </div>

              {/* Comment */}
              <p className="text-gray-700 text-xs leading-relaxed mb-3">
                {review.comment}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{review.location}</span>
                {allowInteraction && (
                  <button
                    className={`flex items-center space-x-1 transition-colors ${
                      review.isLiked
                        ? "text-red-500"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`w-3 h-3 ${
                        review.isLiked ? "fill-current" : ""
                      }`}
                    />
                    <span>{review.likes}</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Load More Button */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mt-8"
        >
          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200">
            Daha Fazla Yorum Gör
          </button>
        </motion.div>
      </div>
    </section>
  );
}
