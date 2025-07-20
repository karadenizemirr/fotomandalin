"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  User,
  Plus,
  CreditCard,
  CheckCircle,
  Camera,
  Lock,
  LogIn,
  Shield,
  Sparkles,
  Star,
  Award,
  Clock,
  MapPin,
} from "lucide-react";
import PackageSelectionStep from "@/components/organisms/wizard/PackageSelectionStep";
import DateTimeStep from "@/components/organisms/wizard/DateTimeStep";
import AddOnsStep from "@/components/organisms/wizard/AddOnsStep";
import PaymentStep from "@/components/organisms/wizard/PaymentStep";
import { ConfirmationStep } from "@/components/organisms/wizard/ConfitmationSetp";

// Booking steps enum
enum BookingStep {
  PACKAGE_SELECTION = 0,
  DATE_TIME = 1,
  CUSTOMER_INFO = 2,
  ADD_ONS = 3,
  PAYMENT = 4,
  CONFIRMATION = 5,
}

// Form data type
type BookingFormData = {
  packageId?: string;
  selectedDate?: string;
  selectedTime?: string;
  locationId?: string;
  staffId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  specialNotes?: string;
  selectedAddOns?: string[];
};

export default function BookingContainer() {
  // Session management
  const { data: session, status } = useSession();
  const router = useRouter();

  // State management
  const [currentStep, setCurrentStep] = useState<BookingStep>(
    BookingStep.PACKAGE_SELECTION
  );
  const [formData, setFormData] = useState<Partial<BookingFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Toast hook
  const { addToast } = useToast();

  // tRPC hooks - Doğru endpoint adları kullanılıyor
  const { data: packagesResponse, isLoading: packagesLoading, error: packagesError } =
    trpc.package.list.useQuery({
      limit: 20,
      includeInactive: false,
    });

  const { data: locationsData } = trpc.location.list.useQuery({
    limit: 100,
    includeInactive: false,
  });

  const { data: addOnsResponse } = trpc.addOn.list.useQuery({
    limit: 50,
    includeInactive: false,
  });

  // Extract the actual data from the response
  const packages = packagesResponse?.items || [];
  const addOns = addOnsResponse?.items || [];
  const locations = locationsData?.items || [];

  // Debug logging for development
  console.log('Packages Response:', packagesResponse);
  console.log('Packages Data:', packages);
  console.log('Packages Error:', packagesError);
  console.log('Packages Loading:', packagesLoading);

  // Get site settings for callback URL
  const { data: siteSettings } = trpc.systemSettings.getSiteSettings.useQuery();
  const { data: callbackUrlSetting } = trpc.systemSettings.getPublic.useQuery({
    key: "callbackUrl",
  });

  // Get booking settings for reservation rules
  const { data: bookingSettings } =
    trpc.systemSettings.getPublicBookingSettings.useQuery();

  const initializePaymentMutation =
    trpc.payment.initiateIyzicoPayment.useMutation();

  const verifyPaymentMutation = trpc.payment.verifyIyzicoPayment.useMutation();
  const createBookingMutation =
    trpc.payment.createBookingFromPayment.useMutation();

  // Auto-populate user data since user is authenticated
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        customerName: session.user.name || "",
        customerEmail: session.user.email || "",
        customerPhone: session.user.phone || "",
      }));
    }
  }, [session]);

  // Check if user is authenticated - hooks'tan sonra kontrol et
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-black mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Yükleniyor...
          </h2>
          <p className="text-gray-600">Rezervasyon sistemi hazırlanıyor</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-gray-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Giriş Gerekli
          </h2>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Rezervasyon oluşturmak için giriş yapın veya ücretsiz hesap
            oluşturun.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Giriş Yap</span>
            </button>

            <button
              onClick={() => router.push("/register")}
              className="w-full bg-white text-black py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Hesap Oluştur
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step configuration
  const steps = [
    {
      id: BookingStep.PACKAGE_SELECTION,
      title: "Paket Seçimi",
      description: "Size uygun fotoğraf paketini seçin",
      icon: Package,
    },
    {
      id: BookingStep.DATE_TIME,
      title: "Tarih & Saat",
      description: "Müsait tarih ve saati belirleyin",
      icon: Calendar,
    },

    {
      id: BookingStep.ADD_ONS,
      title: "Ek Hizmetler",
      description: "İsteğe bağlı ek hizmetleri seçin",
      icon: Plus,
    },
    {
      id: BookingStep.PAYMENT,
      title: "Ödeme",
      description: "Ödeme bilgilerinizi girin",
      icon: CreditCard,
    },
    {
      id: BookingStep.CONFIRMATION,
      title: "Onay",
      description: "Rezervasyonunuz tamamlandı",
      icon: CheckCircle,
    },
  ];

  // Validation functions for each step
  const validateCurrentStep = () => {
    switch (currentStep) {
      case BookingStep.PACKAGE_SELECTION:
        return !!formData.packageId;

      case BookingStep.DATE_TIME:
        if (
          !(
            formData.selectedDate &&
            formData.selectedTime &&
            formData.locationId
          )
        ) {
          return false;
        }

        // Use booking settings validation
        const dateTimeValidation = validateBookingDateTime(
          formData.selectedDate,
          formData.selectedTime
        );

        if (!dateTimeValidation.isValid) {
          // Show validation error
          addToast({
            type: "error",
            message: dateTimeValidation.message || "Geçersiz tarih/saat seçimi",
          });
          return false;
        }

        return true;

      case BookingStep.CUSTOMER_INFO:
        if (!formData.customerName || formData.customerName.length < 2)
          return false;
        if (
          !formData.customerEmail ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)
        )
          return false;
        if (
          !formData.customerPhone ||
          !/^(\+90|0)?[5][0-9]{9}$/.test(
            formData.customerPhone.replace(/\s/g, "")
          )
        )
          return false;
        return true;

      case BookingStep.ADD_ONS:
        return true; // Add-ons are optional

      default:
        return false;
    }
  };

  // Navigation functions
  const nextStep = () => {
    if (validateCurrentStep() && currentStep < BookingStep.CONFIRMATION) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > BookingStep.PACKAGE_SELECTION) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Update form data
  const updateFormData = (stepData: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  // Booking validation functions based on settings
  const validateBookingDateTime = (
    selectedDate: string,
    selectedTime: string
  ) => {
    if (!bookingSettings) return { isValid: true };

    const now = new Date();
    const bookingDateTime = new Date(`${selectedDate}T${selectedTime}`);

    // Check if booking is too far in advance
    const daysDifference = Math.ceil(
      (bookingDateTime.getTime() - now.getTime()) / (1000 * 3600 * 24)
    );

    if (daysDifference > bookingSettings.maximumAdvanceBookingDays) {
      return {
        isValid: false,
        message: `En fazla ${bookingSettings.maximumAdvanceBookingDays} gün öncesinden rezervasyon yapabilirsiniz.`,
      };
    }

    // Check minimum booking hours
    const hoursDifference = Math.ceil(
      (bookingDateTime.getTime() - now.getTime()) / (1000 * 3600)
    );

    if (hoursDifference < bookingSettings.minimumBookingHours) {
      return {
        isValid: false,
        message: `En az ${bookingSettings.minimumBookingHours} saat öncesinden rezervasyon yapmalısınız.`,
      };
    }

    // Check working hours
    const [startHour, startMinute] = bookingSettings.workingHoursStart
      .split(":")
      .map(Number);
    const [endHour, endMinute] = bookingSettings.workingHoursEnd
      .split(":")
      .map(Number);
    const [bookingHour, bookingMinute] = selectedTime.split(":").map(Number);

    const bookingTimeInMinutes = bookingHour * 60 + bookingMinute;
    const workingStartInMinutes = startHour * 60 + startMinute;
    const workingEndInMinutes = endHour * 60 + endMinute;

    if (
      bookingTimeInMinutes < workingStartInMinutes ||
      bookingTimeInMinutes > workingEndInMinutes
    ) {
      return {
        isValid: false,
        message: `Çalışma saatleri arasında (${bookingSettings.workingHoursStart} - ${bookingSettings.workingHoursEnd}) rezervasyon yapabilirsiniz.`,
      };
    }

    return { isValid: true };
  };

  // Check if cancellation is allowed
  const canCancelBooking = (bookingDateTime: string) => {
    if (!bookingSettings) return false;

    const now = new Date();
    const booking = new Date(bookingDateTime);
    const hoursDifference = Math.ceil(
      (booking.getTime() - now.getTime()) / (1000 * 3600)
    );

    return hoursDifference >= bookingSettings.cancellationHours;
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = 0;

    if (formData.packageId && packages) {
      const selectedPackage = packages.find(
        (p: any) => p.id === formData.packageId
      );
      if (selectedPackage) {
        total += parseFloat(selectedPackage.basePrice);
      }
    }

    if (formData.selectedAddOns && addOns) {
      formData.selectedAddOns.forEach((addOnId) => {
        const addOn = addOns.find((a: any) => a.id === addOnId);
        if (addOn) {
          total += parseFloat(addOn.price);
        }
      });
    }

    // Add location extra fee
    if (formData.locationId && locations) {
      const selectedLocation = locations.find(
        (loc: any) => loc.id === formData.locationId
      );
      if (selectedLocation && selectedLocation.extraFee) {
        const extraFee = parseFloat(selectedLocation.extraFee);
        if (!isNaN(extraFee) && extraFee > 0) {
          total += extraFee;
        }
      }
    }

    return total;
  };

  // Final booking submission
  const handleBookingSubmit = async () => {
    setIsLoading(true);
    try {
      if (
        !formData.packageId ||
        !formData.selectedDate ||
        !formData.selectedTime ||
        !formData.customerName ||
        !formData.customerEmail ||
        !formData.customerPhone ||
        !formData.locationId
      ) {
        throw new Error("Gerekli alanlar eksik");
      }

      // Get package info for payment
      const selectedPackage = packages.find(
        (p: any) => p.id === formData.packageId
      );
      if (!selectedPackage) {
        throw new Error("Seçili paket bulunamadı");
      }

      // Get location info for extra fee
      const selectedLocation = locations.find(
        (l: any) => l.id === formData.locationId
      );

      // Get selected add-ons info
      const selectedAddOnsData =
        addOns?.filter((addOn: any) =>
          formData.selectedAddOns?.includes(addOn.id)
        ) || [];

      const totalAmount = calculateTotalPrice();

      // Validate minimum amount
      if (totalAmount < 1) {
        throw new Error("Minimum ödeme tutarı 1 TL olmalıdır");
      }

      // Save booking data to localStorage for recovery if payment fails
      const bookingFormData = {
        packageId: formData.packageId,
        selectedDate: formData.selectedDate,
        selectedTime: formData.selectedTime,
        locationId: formData.locationId,
        staffId: formData.staffId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        specialNotes: formData.specialNotes,
        selectedAddOns: formData.selectedAddOns,
        totalAmount,
        userId: session?.user?.id,
      };

      localStorage.setItem(
        "pendingBookingData",
        JSON.stringify(bookingFormData)
      );

      // Prepare callback URL from site settings
      const callbackUrl =
        callbackUrlSetting || `${window.location.origin}/api/payment/callback`;

      // Initiate İyzico payment via tRPC
      const paymentResponse = await initializePaymentMutation.mutateAsync({
        packageId: formData.packageId,
        packageName: selectedPackage.name,
        packagePrice: Number(selectedPackage.basePrice),
        selectedAddOns: selectedAddOnsData.map((addOn: any) => ({
          id: addOn.id,
          name: addOn.name,
          price: Number(addOn.price),
        })),
        locationId: formData.locationId,
        locationName: selectedLocation?.name || "Bilinmeyen Lokasyon",
        locationFee: selectedLocation?.extraFee
          ? Number(selectedLocation.extraFee)
          : 0,
        totalAmount,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone.replace(/\s/g, ""), // Remove spaces
        selectedDate: formData.selectedDate,
        selectedTime: formData.selectedTime,
        specialNotes: formData.specialNotes || "",
        callbackUrl,
      });

      if (paymentResponse.success && paymentResponse.paymentPageUrl) {
        // Show loading state briefly before redirect
        addToast({
          type: "success",
          message: "Ödeme sayfasına yönlendiriliyorsunuz...",
        });

        // Add small delay for better UX
        setTimeout(() => {
          // Redirect to İyzico payment page
          window.location.href = paymentResponse.paymentPageUrl!;
        }, 1000);
      } else {
        throw new Error(
          paymentResponse.error || "Ödeme sayfası oluşturulamadı"
        );
      }
    } catch (error: any) {
      console.error("Payment initialization error:", error);
      addToast({
        type: "error",
        message: error.message || "Ödeme başlatılırken bir hata oluştu",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Rezervasyon
                </h1>
                <p className="text-gray-600 text-sm">
                  Fotoğraf çekim rezervasyonu oluşturun
                </p>
              </div>
            </div>

            {/* Simple User Info */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{session?.user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Layout */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Steps */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Rezervasyon Adımları
              </h3>
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-black text-white"
                          : isCompleted
                          ? "bg-gray-100 text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive
                            ? "bg-white text-black"
                            : isCompleted
                            ? "bg-white text-gray-700"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs opacity-75">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Booking Rules Section */}
              {bookingSettings && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Rezervasyon Kuralları
                  </h4>
                  <div className="space-y-3 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Çalışma Saatleri:</span>
                      <span className="font-medium text-gray-900">
                        {bookingSettings.workingHoursStart} -{" "}
                        {bookingSettings.workingHoursEnd}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Minimum Süre:</span>
                      <span className="font-medium text-gray-900">
                        {bookingSettings.minimumBookingHours} saat öncesinden
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Maksimum Süre:</span>
                      <span className="font-medium text-gray-900">
                        {bookingSettings.maximumAdvanceBookingDays} gün
                        öncesinden
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>İptal Süresi:</span>
                      <span className="font-medium text-gray-900">
                        {bookingSettings.cancellationHours} saat öncesinden
                      </span>
                    </div>
                    {bookingSettings.autoConfirmBookings && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>Otomatik onay</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Step Content */}
              <div className="p-8">
                {/* Simple Step Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {steps[currentStep]?.title}
                  </h2>
                  <p className="text-gray-600">
                    {steps[currentStep]?.description}
                  </p>
                </div>
                {/* Step 1: Package Selection */}
                {currentStep === BookingStep.PACKAGE_SELECTION && (
                  <PackageSelectionStep
                    packages={packages || []}
                    isLoading={packagesLoading}
                    selectedPackageId={formData.packageId}
                    onSelect={(packageId: string) =>
                      updateFormData({ packageId })
                    }
                  />
                )}

                {/* Step 2: Date & Time */}
                {currentStep === BookingStep.DATE_TIME && (
                  <DateTimeStep
                    selectedDate={formData.selectedDate}
                    selectedTime={formData.selectedTime}
                    locationId={formData.locationId}
                    staffId={formData.staffId}
                    locations={locations || []}
                    bookingSettings={bookingSettings}
                    onUpdate={updateFormData}
                  />
                )}

                {/* Step 3: Add-ons */}
                {currentStep === BookingStep.ADD_ONS && (
                  <AddOnsStep
                    addOns={addOns || []}
                    selectedAddOns={formData.selectedAddOns || []}
                    onUpdate={(selectedAddOns: string[]) =>
                      updateFormData({ selectedAddOns })
                    }
                  />
                )}

                {/* Step 4: Payment */}
                {currentStep === BookingStep.PAYMENT && (
                  <PaymentStep
                    formData={formData}
                    totalPrice={calculateTotalPrice()}
                    packages={packages || []}
                    addOns={addOns || []}
                    locations={locations || []}
                    bookingSettings={bookingSettings}
                    onSubmit={handleBookingSubmit}
                    isLoading={isLoading}
                  />
                )}

                {/* Step 5: Confirmation */}
                {currentStep === BookingStep.CONFIRMATION && (
                  <ConfirmationStep formData={formData} />
                )}
              </div>

              {/* Simple Navigation */}
              {currentStep !== BookingStep.CONFIRMATION && (
                <div className="bg-gray-50 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={prevStep}
                      disabled={currentStep === BookingStep.PACKAGE_SELECTION}
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      <span>Geri</span>
                    </button>

                    <div className="text-sm text-gray-500">
                      {currentStep + 1} / {steps.length}
                    </div>

                    <button
                      onClick={nextStep}
                      disabled={
                        !validateCurrentStep() ||
                        currentStep === BookingStep.PAYMENT
                      }
                      className="flex items-center px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span>
                        {currentStep === BookingStep.PAYMENT
                          ? "Ödemeyi Tamamla"
                          : "İleri"}
                      </span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
