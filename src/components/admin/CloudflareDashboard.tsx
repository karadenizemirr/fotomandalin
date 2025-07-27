"use client";

import { useState, useEffect } from "react";
import {
  Cloud,
  Zap,
  Shield,
  BarChart3,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

interface CloudflareData {
  analytics: any;
  zone: any;
  security: any;
  performance: any;
}

export default function CloudflareDashboard() {
  const [data, setData] = useState<CloudflareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/analytics/cloudflare/summary", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Cloudflare data");
      }

      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const purgeCache = async (type: string = "all") => {
    try {
      setPurging(true);
      const response = await fetch("/api/admin/cache/purge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error("Failed to purge cache");
      }

      // Show success message
      alert("Cache başarıyla temizlendi!");
    } catch (err) {
      alert(
        "Cache temizlenirken hata oluştu: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setPurging(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-black"></div>
        <span className="ml-3 text-gray-600">
          Cloudflare verileri yükleniyor...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">
            {error || "Cloudflare verileri yüklenemedi"}
          </span>
        </div>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Cloud className="w-8 h-8 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cloudflare Dashboard
            </h1>
            <p className="text-gray-600">
              CDN, güvenlik ve performans yönetimi
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Yenile
          </button>

          <button
            onClick={() => purgeCache()}
            disabled={purging}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {purging ? "Temizleniyor..." : "Cache Temizle"}
          </button>
        </div>
      </div>

      {/* Zone Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Zone Durumu</h2>
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700 font-medium">
              {data.zone.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Domain</p>
            <p className="font-medium">{data.zone.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Plan</p>
            <p className="font-medium">{data.zone.plan}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">SSL</p>
            <p className="font-medium">{data.security.ssl}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {data.analytics?.totals?.requests?.all || 0}
              </p>
              <p className="text-sm text-gray-500">Toplam İstek (24h)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  ((data.analytics?.totals?.requests?.cached || 0) /
                    (data.analytics?.totals?.requests?.all || 1)) *
                    100
                )}
                %
              </p>
              <p className="text-sm text-gray-500">Cache Hit Oranı</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {data.analytics?.totals?.threats?.all || 0}
              </p>
              <p className="text-sm text-gray-500">Engellenen Tehdit</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Zap className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {data.analytics?.totals?.bandwidth?.all
                  ? Math.round(
                      data.analytics.totals.bandwidth.all / 1024 / 1024
                    )
                  : 0}
                MB
              </p>
              <p className="text-sm text-gray-500">Bandwidth (24h)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Güvenlik Ayarları
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Güvenlik Seviyesi</span>
              <span className="font-medium">{data.security.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SSL Modu</span>
              <span className="font-medium">{data.security.ssl}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performans Ayarları
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Minify CSS</span>
              <span className="font-medium">{data.performance.minify.css}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Minify JS</span>
              <span className="font-medium">{data.performance.minify.js}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Brotli Compression</span>
              <span className="font-medium">{data.performance.brotli}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cache Yönetimi
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => purgeCache("packages")}
            disabled={purging}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Paketler Cache
          </button>
          <button
            onClick={() => purgeCache("gallery")}
            disabled={purging}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Galeri Cache
          </button>
          <button
            onClick={() => purgeCache("static")}
            disabled={purging}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
          >
            Static Cache
          </button>
          <button
            onClick={() => purgeCache()}
            disabled={purging}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Tüm Cache
          </button>
        </div>
      </div>
    </div>
  );
}
