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
  onUpdate,
}: any) {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);

  // Generate available time slots based on location working hours
  const generateAvailableTimes = useCallback(
    (date: string, locId?: string): string[] => {
      const times: string[] = [];
      const selectedDateObj = new Date(date);
      const today = new Date();

      // Get day of week in lowercase format
      const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const dayOfWeek = dayNames[selectedDateObj.getDay()];

      // Get selected location's working hours
      let workingHours = null;
      if (locId && locations.length > 0) {
        const selectedLocation = locations.find((loc: any) => loc.id === locId);
        if (selectedLocation && selectedLocation.workingHours) {
          try {
            const parsedHours =
              typeof selectedLocation.workingHours === "string"
                ? JSON.parse(selectedLocation.workingHours)
                : selectedLocation.workingHours;
            workingHours = parsedHours[dayOfWeek];
          } catch {
            console.error("Error parsing working hours");
          }
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
      const [startHour] = workingHours.start.split(":").map(Number);
      const [endHour] = workingHours.end.split(":").map(Number);

      // Generate time slots every 2 hours
      for (let hour = startHour; hour <= endHour - 2; hour += 2) {
        const timeSlot = `${hour.toString().padStart(2, "0")}:00`;

        // If it's today, only show future time slots based on booking settings
        if (selectedDateObj.toDateString() === today.toDateString()) {
          const currentHour = today.getHours();
          const minimumHours = bookingSettings?.minimumBookingHours || 1;
          if (hour <= currentHour + minimumHours) {
            continue; // Respect minimum booking hours from settings
          }
        }

        times.push(timeSlot);
      }

      return times;
    },
    [locations, bookingSettings]
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
    availableTimes.length,
    generateAvailableTimes,
    locations,
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
      const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const dayOfWeek = dayNames[selectedDateObj.getDay()];
      const parsedHours =
        typeof location.workingHours === "string"
          ? JSON.parse(location.workingHours)
          : location.workingHours;
      const dayHours = parsedHours[dayOfWeek];

      if (!dayHours) {
        return {
          closed: true,
          dayName: selectedDateObj.toLocaleDateString("tr-TR", {
            weekday: "long",
          }),
        };
      }

      return {
        closed: false,
        start: dayHours.start,
        end: dayHours.end,
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
                    {location.extraFee > 0 && `(+₺${location.extraFee})`}
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
                      : "Lütfen farklı bir tarih seçiniz"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeChange(time)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                        selectedTime === time
                          ? "border-orange-500 bg-orange-50 text-orange-700 font-medium"
                          : "border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
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
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Seçilen Tarih ve Saat
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    <span className="font-medium">
                      {new Date(selectedDate).toLocaleDateString("tr-TR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <br />
                    Saat: {selectedTime}
                    <br />
                    Lokasyon: {selectedLocation?.name}
                    {selectedLocation?.extraFee > 0 && (
                      <span className="text-orange-600">
                        {" "}
                        (+₺{selectedLocation.extraFee})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
