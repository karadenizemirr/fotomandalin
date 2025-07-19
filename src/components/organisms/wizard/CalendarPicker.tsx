import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

// Simple Calendar Component
export default function CalendarPicker({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
}: {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  minDate?: Date;
  maxDate?: Date;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const minimumDate = minDate || today;

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(year, month, day);
      days.push(currentDate);
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const isDateDisabled = (date: Date | null) => {
    if (!date) return true;

    // Disable past dates
    if (date < minimumDate) return true;

    // Disable dates beyond maximum advance booking
    if (maxDate && date > maxDate) return true;

    return false;
  };

  const isDateSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toISOString().split("T")[0] === selectedDate;
  };

  const handleDateClick = (date: Date | null) => {
    if (!date || isDateDisabled(date)) return;
    onDateSelect(date.toISOString().split("T")[0]);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-medium text-gray-900 capitalize">
          {monthYear}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(date)}
            disabled={isDateDisabled(date)}
            className={`
              aspect-square flex items-center justify-center text-sm rounded-lg transition-all duration-200
              ${!date ? "invisible" : ""}
              ${
                isDateDisabled(date)
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              }
              ${
                isDateSelected(date)
                  ? "bg-orange-500 text-white font-medium shadow-md"
                  : ""
              }
            `}
          >
            {date?.getDate()}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span>Seçilen tarih</span>
        </div>
      </div>
    </div>
  );
}
