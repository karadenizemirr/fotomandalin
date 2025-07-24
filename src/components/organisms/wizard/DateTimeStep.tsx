import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Clock, Info } from "lucide-react";
import CalendarPicker from "./CalendarPicker";

// Placeholder components for other steps
export default function DateTimeStep({
  selectedDate,
  selectedTime,
  locationId,
  staffId: _staffId,
  locations,
  bookingSettings,
  packages, // Add packages prop to get selected package duration
  selectedPackageId, // Add selected package id
  onUpdate,
}: any) {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);

  // Generate available time slots based on location working hours and package duration
  const generateAvailableTimes = useCallback(
    (date: string, locId?: string): string[] => {
      const times: string[] = [];
      const selectedDateObj = new Date(date);
      const today = new Date();

      // Get selected package duration
      let sessionDuration = 120; // Default 2 hours in minutes
      if (selectedPackageId && packages && packages.length > 0) {
        const selectedPackage = packages.find(
          (pkg: any) => pkg.id === selectedPackageId
        );
        if (selectedPackage && selectedPackage.durationInMinutes) {
          sessionDuration = selectedPackage.durationInMinutes;
        }
      }

      // Get selected location's working hours
      let workingHours = null;
      if (locId && locations.length > 0) {
        const selectedLocation = locations.find((loc: any) => loc.id === locId);
        if (selectedLocation && selectedLocation.workingHours) {
          // Location working hours are stored as { start: "09:00", end: "23:00" }
          workingHours = selectedLocation.workingHours;
        }
      }

      // Default working hours if no location selected or location has no working hours
      if (!workingHours) {
        // Use booking settings working hours as default, fallback to 9:00 - 17:00
        const defaultStart = bookingSettings?.workingHoursStart || "09:00";
        const defaultEnd = bookingSettings?.workingHoursEnd || "17:00";
        workingHours = { start: defaultStart, end: defaultEnd };
      }

      // If working hours is null (location closed that day), return empty
      if (!workingHours || !workingHours.start || !workingHours.end) {
        return times;
      }

      // Parse start and end times
      const [startHour, startMinute] = workingHours.start
        .split(":")
        .map(Number);
      const [endHour, endMinute] = workingHours.end.split(":").map(Number);

      // Generate time slots with system settings intervals
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;

      // Use booking settings for slot intervals, default to 2 hours (120 minutes)
      const intervalMinutes = bookingSettings?.slotIntervalMinutes || 120;

      for (
        let timeInMinutes = startTimeInMinutes;
        timeInMinutes <= endTimeInMinutes; // Changed back to <= to include end time (23:00)
        timeInMinutes += intervalMinutes
      ) {
        const hour = Math.floor(timeInMinutes / 60);
        const minute = timeInMinutes % 60;
        const timeSlot = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        // Allow the end time slot (like 23:00) to be selectable even if session extends beyond working hours
        // Only check if start time is within working hours
        if (timeInMinutes > endTimeInMinutes) {
          break; // Don't add slots that start beyond working hours
        }

        // If it's today, only show future time slots based on booking settings
        if (selectedDateObj.toDateString() === today.toDateString()) {
          const currentHour = today.getHours();
          const currentMinute = today.getMinutes();
          const currentTimeInMinutes = currentHour * 60 + currentMinute;
          const minimumHours = bookingSettings?.minimumBookingHours || 1;
          const minimumTimeInMinutes = currentTimeInMinutes + minimumHours * 60;

          if (timeInMinutes <= minimumTimeInMinutes) {
            continue; // Respect minimum booking hours from settings
          }
        }

        times.push(timeSlot);
      }

      // Ensure we have at least some slots even if working hours are short
      if (
        times.length === 0 &&
        selectedDateObj.toDateString() !== today.toDateString()
      ) {
        // Add the start time as the only option if no other slots are available
        const startTimeSlot = `${startHour
          .toString()
          .padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;
        times.push(startTimeSlot);
      }

      return times;
    },
    [locations, bookingSettings, packages, selectedPackageId]
  );

  // Update available times when date or location changes
  const handleDateChange = (date: string) => {
    setIsLoadingTimes(true);
    onUpdate({ selectedDate: date, selectedTime: "" });

    setTimeout(() => {
      setAvailableTimes(generateAvailableTimes(date, locationId));
      setIsLoadingTimes(false);
    }, 300);
  };

  const handleTimeChange = (time: string) => {
    onUpdate({ selectedTime: time });
  };

  const handleLocationChange = (locId: string) => {
    onUpdate({ locationId: locId });

    // Regenerate available times when location changes
    if (selectedDate) {
      setIsLoadingTimes(true);
      setTimeout(() => {
        setAvailableTimes(generateAvailableTimes(selectedDate, locId));
        setIsLoadingTimes(false);
      }, 300);
    }
  };

  // Generate times when date is first selected
  useEffect(() => {
    if (selectedDate && availableTimes.length === 0) {
      setAvailableTimes(generateAvailableTimes(selectedDate, locationId));
    }
  }, [
    selectedDate,
    locationId,
    selectedPackageId,
    availableTimes.length,
    generateAvailableTimes,
    locations,
    packages,
  ]);

  // Get selected location details for display
  const selectedLocation = locationId
    ? locations.find((loc: any) => loc.id === locationId)
    : null;
  const getLocationWorkingInfo = (locId?: string) => {
    if (!locId || !selectedDate) return null;

    const location = locations.find((loc: any) => loc.id === locId);
    if (!location || !location.workingHours) return null;

    try {
      const selectedDateObj = new Date(selectedDate);
      const workingHours = location.workingHours;

      // Check if location has working hours for the day
      if (!workingHours || !workingHours.start || !workingHours.end) {
        return {
          closed: true,
          dayName: selectedDateObj.toLocaleDateString("tr-TR", {
            weekday: "long",
          }),
        };
      }

      return {
        closed: false,
        start: workingHours.start,
        end: workingHours.end,
        dayName: selectedDateObj.toLocaleDateString("tr-TR", {
          weekday: "long",
        }),
      };
    } catch {
      return null;
    }
  };

  const locationWorkingInfo = getLocationWorkingInfo(locationId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tarih ve Saat Seçimi
        </h2>
        <p className="text-gray-600">
          Müsait tarih ve saati belirleyerek devam edin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Date Selection with Calendar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tarih Seçimi *
          </label>
          <CalendarPicker
            selectedDate={selectedDate}
            onDateSelect={handleDateChange}
            minDate={new Date()}
            maxDate={
              bookingSettings
                ? new Date(
                    new Date().getTime() +
                      bookingSettings.maximumAdvanceBookingDays *
                        24 *
                        60 *
                        60 *
                        1000
                  )
                : undefined
            }
          />
        </div>

        {/* Time and Location Selection */}
        <div className="space-y-6">
          {/* Location Selection */}
          {locations && locations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Çekim Lokasyonu *
              </label>
              <select
                value={locationId || ""}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Lokasyon seçiniz</option>
                {locations.map((location: any) => (
                  <option key={location.id} value={location.id}>
                    {location.name}{" "}
                    {location.extraFee &&
                      parseFloat(location.extraFee) > 0 &&
                      `(+₺${location.extraFee})`}
                  </option>
                ))}
              </select>

              {/* Location working hours info */}
              {selectedLocation && selectedDate && locationWorkingInfo && (
                <div
                  className={`mt-2 p-3 rounded-lg border ${
                    locationWorkingInfo.closed
                      ? "bg-red-50 border-red-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center">
                    <Info
                      className={`w-4 h-4 mr-2 ${
                        locationWorkingInfo.closed
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        locationWorkingInfo.closed
                          ? "text-red-700"
                          : "text-blue-700"
                      }`}
                    >
                      {locationWorkingInfo.closed
                        ? `${selectedLocation.name} ${locationWorkingInfo.dayName} günü kapalıdır`
                        : `${selectedLocation.name} çalışma saatleri: ${locationWorkingInfo.start} - ${locationWorkingInfo.end}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Time Selection */}
          {selectedDate && locationId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Saat Seçimi *
              </label>

              {/* Working hours info */}
              {locationWorkingInfo && !locationWorkingInfo.closed && (
                <div className="mb-3 text-xs text-gray-500">
                  Çalışma saatleri: {locationWorkingInfo.start} -{" "}
                  {locationWorkingInfo.end}
                </div>
              )}

              {isLoadingTimes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  <span className="ml-2 text-gray-500">
                    Müsait saatler yükleniyor...
                  </span>
                </div>
              ) : availableTimes.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Bu tarih için müsait saat yok
                  </h3>
                  <p className="text-gray-500">
                    {locationWorkingInfo?.closed
                      ? "Seçilen lokasyon bu gün kapalıdır"
                      : "Lütfen farklı bir tarih seçiniz veya lokasyon değiştirin"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-80 overflow-y-auto">
                    {availableTimes.map((time, index) => {
                      return (
                        <button
                          key={time}
                          onClick={() => handleTimeChange(time)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                            selectedTime === time
                              ? "bg-orange-500 text-white shadow-sm"
                              : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warning if no location selected */}
          {selectedDate && !locationId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Lokasyon seçimi gerekli
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Müsait saatleri görebilmek için önce bir lokasyon seçiniz.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selected Info */}
          {selectedDate && selectedTime && locationId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Rezervasyon Özeti
                  </p>
                  <div className="text-sm text-green-600 mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Tarih:</span>
                      <span>
                        {new Date(selectedDate).toLocaleDateString("tr-TR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Başlangıç:</span>
                      <span>{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tahmini Bitiş:</span>
                      <span>
                        {(() => {
                          const [hour, minute] = selectedTime
                            .split(":")
                            .map(Number);

                          // Get actual session duration from selected package
                          let sessionDuration = 120; // Default 2 hours
                          if (
                            selectedPackageId &&
                            packages &&
                            packages.length > 0
                          ) {
                            const selectedPackage = packages.find(
                              (pkg: any) => pkg.id === selectedPackageId
                            );
                            if (
                              selectedPackage &&
                              selectedPackage.durationInMinutes
                            ) {
                              sessionDuration =
                                selectedPackage.durationInMinutes;
                            }
                          }

                          const endHour = Math.floor(
                            (hour * 60 + minute + sessionDuration) / 60
                          );
                          const endMinute =
                            (hour * 60 + minute + sessionDuration) % 60;
                          return `${endHour
                            .toString()
                            .padStart(2, "0")}:${endMinute
                            .toString()
                            .padStart(2, "0")}`;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Lokasyon:</span>
                      <span>{selectedLocation?.name}</span>
                    </div>
                    {selectedLocation?.extraFee &&
                      parseFloat(selectedLocation.extraFee) > 0 && (
                        <div className="flex justify-between">
                          <span className="font-medium">Lokasyon Ücreti:</span>
                          <span className="text-orange-600 font-semibold">
                            +₺{selectedLocation.extraFee}
                          </span>
                        </div>
                      )}
                    <div className="pt-2 border-t border-green-200 mt-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Çekim Süresi:</span>
                        <span className="text-green-700 font-semibold">
                          {(() => {
                            // Get actual session duration from selected package
                            if (
                              selectedPackageId &&
                              packages &&
                              packages.length > 0
                            ) {
                              const selectedPackage = packages.find(
                                (pkg: any) => pkg.id === selectedPackageId
                              );
                              if (
                                selectedPackage &&
                                selectedPackage.durationInMinutes
                              ) {
                                const hours = Math.floor(
                                  selectedPackage.durationInMinutes / 60
                                );
                                const minutes =
                                  selectedPackage.durationInMinutes % 60;
                                return `${hours > 0 ? `${hours} saat` : ""} ${
                                  minutes > 0 ? `${minutes} dakika` : ""
                                }`.trim();
                              }
                            }
                            return "~2 saat";
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
