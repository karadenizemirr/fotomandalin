"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useSiteSettingsWithDefaults } from "@/contexts/SiteSettingsContext";
import Topbar from "./topbar";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Get site settings
  const { siteName, logo } = useSiteSettingsWithDefaults();

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside for user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  const handleSignOut = async () => await signOut({ callbackUrl: "/" });
  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Topbar */}
      <Topbar useApi={true} autoRotate={true} rotationInterval={8} />

      {/* Main Navbar */}
      <nav
        className={`w-full z-50 transition-all duration-300 border-b border-gray-100 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm py-2"
            : "bg-white py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo - Left Side */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                {logo ? (
                  <div className="relative w-44 h-18 md:w-52 md:h-20">
                    <Image
                      src={logo}
                      alt={siteName}
                      fill
                      className="object-contain"
                      priority
                      sizes="(max-width: 768px) 176px, 208px"
                    />
                  </div>
                ) : (
                  <div className="w-18 h-18 md:w-20 md:h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-4xl md:text-5xl">
                      F
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Right Side - Navigation & Auth */}
            <div className="flex items-center">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive("/")
                      ? "text-amber-600 bg-amber-50"
                      : "text-gray-700 hover:text-amber-600 hover:bg-gray-50"
                  }`}
                >
                  Ana Sayfa
                </Link>
                <Link
                  href="/hizmetlerimiz"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive("/hizmetlerimiz")
                      ? "text-amber-600 bg-amber-50"
                      : "text-gray-700 hover:text-amber-600 hover:bg-gray-50"
                  }`}
                >
                  Hizmetler
                </Link>
                <Link
                  href="/calismalarimiz"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive("/calismalarimiz")
                      ? "text-amber-600 bg-amber-50"
                      : "text-gray-700 hover:text-amber-600 hover:bg-gray-50"
                  }`}
                >
                  Galeri
                </Link>
                <Link
                  href="/iletisim"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive("/iletisim")
                      ? "text-amber-600 bg-amber-50"
                      : "text-gray-700 hover:text-amber-600 hover:bg-gray-50"
                  }`}
                >
                  İletişim
                </Link>
              </div>

              {/* Auth & Action Buttons */}
              <div className="ml-6 flex items-center">
                {status === "loading" ? (
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                ) : session ? (
                  <div className="flex items-center space-x-3">
                    {/* Reservation Button for logged in users */}
                    <div className="hidden md:block">
                      <Link
                        href="/rezervasyon"
                        className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:from-amber-600 hover:to-amber-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Rezervasyon
                      </Link>
                    </div>

                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={toggleUserMenu}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-black transition-all duration-200"
                      >
                        {session.user?.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || "Kullanıcı"}
                            className="w-8 h-8 rounded-full ring-2 ring-amber-100"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center ring-2 ring-amber-200">
                            <User className="w-4 h-4 text-amber-600" />
                          </div>
                        )}
                        <span className="text-sm font-medium hidden sm:inline">
                          {session.user?.name?.split(" ")[0] || "Kullanıcı"}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden backdrop-blur-sm">
                          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-amber-100">
                            <p className="text-sm font-semibold text-gray-900">
                              {session.user?.name}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {session.user?.email}
                            </p>
                          </div>
                          <div className="py-2">
                            <Link
                              href="/hesabim/profilim"
                              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-colors"
                            >
                              <Settings className="w-4 h-4 mr-3" />
                              Hesabım
                            </Link>
                            <Link
                              href="/hesabim/rezervasyonlarim"
                              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-colors"
                            >
                              <Settings className="w-4 h-4 mr-3" />
                              Rezervasyonlarım
                            </Link>
                            <button
                              onClick={handleSignOut}
                              className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="w-4 h-4 mr-3" />
                              Çıkış Yap
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/giris-yap"
                      className="text-sm font-medium text-gray-700 hover:text-amber-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      href="/kayit-ol"
                      className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Kayıt Ol
                    </Link>
                    <div className="hidden md:block">
                      <Link
                        href="/rezervasyon"
                        className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:from-amber-600 hover:to-amber-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Rezervasyon
                      </Link>
                    </div>
                  </div>
                )}

                {/* Mobile Menu Button */}
                <button
                  onClick={toggleMenu}
                  className="ml-4 md:hidden p-2 text-gray-700 hover:text-black rounded-md hover:bg-gray-100"
                  aria-label="Menu"
                >
                  {isMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMenuOpen ? "min-h-80 opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
          >
            <div className="py-3 space-y-2 border-t border-gray-100 bg-gray-50 rounded-lg mx-2">
              <Link
                href="/"
                className={`block px-4 py-3 text-base font-medium rounded-lg mx-3 transition-all duration-200 ${
                  isActive("/")
                    ? "text-amber-600 bg-amber-50"
                    : "text-gray-700 hover:text-amber-600 hover:bg-white"
                }`}
              >
                Ana Sayfa
              </Link>
              <Link
                href="/hizmetlerimiz"
                className={`block px-4 py-3 text-base font-medium rounded-lg mx-3 transition-all duration-200 ${
                  isActive("/hizmetlerimiz")
                    ? "text-amber-600 bg-amber-50"
                    : "text-gray-700 hover:text-amber-600 hover:bg-white"
                }`}
              >
                Hizmetler
              </Link>
              <Link
                href="/calismalarimiz"
                className={`block px-4 py-3 text-base font-medium rounded-lg mx-3 transition-all duration-200 ${
                  isActive("/calismalarimiz")
                    ? "text-amber-600 bg-amber-50"
                    : "text-gray-700 hover:text-amber-600 hover:bg-white"
                }`}
              >
                Galeri
              </Link>
              <Link
                href="/iletisim"
                className={`block px-4 py-3 text-base font-medium rounded-lg mx-3 transition-all duration-200 ${
                  isActive("/iletisim")
                    ? "text-amber-600 bg-amber-50"
                    : "text-gray-700 hover:text-amber-600 hover:bg-white"
                }`}
              >
                İletişim
              </Link>

              {/* Mobile Auth & Action Buttons */}
              {!session && (
                <div className="px-3 pt-2 space-y-2">
                  <Link
                    href="/giris-yap"
                    className="block w-full text-center bg-white text-gray-700 border border-gray-200 px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-50 hover:text-amber-600 transition-all duration-200"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/kayit-ol"
                    className="block w-full text-center bg-gray-900 text-white px-4 py-3 rounded-lg text-base font-semibold hover:bg-gray-800 transition-all duration-200 shadow-md"
                  >
                    Kayıt Ol
                  </Link>
                  <Link
                    href="/rezervasyon"
                    className="block w-full text-center bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-lg text-base font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-md"
                  >
                    Rezervasyon Oluştur
                  </Link>
                </div>
              )}

              {/* Mobile Reservation Button for logged in users */}
              {session && (
                <div className="px-3 pt-2">
                  <Link
                    href="/rezervasyon"
                    className="block w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-lg text-center text-base font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-md"
                  >
                    Rezervasyon Oluştur
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
