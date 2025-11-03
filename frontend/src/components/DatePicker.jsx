import { useState, useEffect, useRef } from 'react';
import './DatePicker.css';

const DatePicker = ({ value, onChange, placeholder = 'mm/dd/yyyy' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const pickerRef = useRef(null);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setCurrentMonth(date);
      setCurrentMonthIndex(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDisplayDate = (date) => {
    if (!date) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatInputDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDaysArray = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month's trailing days
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, daysInPrevMonth - i);
      days.push({ date, isCurrentMonth: false, isPast: date < today });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      days.push({ date, isCurrentMonth: true, isPast: date < today });
    }

    // Next month's leading days to fill the grid
    const remainingCells = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i);
      days.push({ date, isCurrentMonth: false, isPast: date < today });
    }

    return days;
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isSameDay(date, today);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleDone = () => {
    if (selectedDate) {
      onChange(formatInputDate(selectedDate));
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    // Reset to original value
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
    } else {
      setSelectedDate(null);
    }
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setCurrentMonthIndex((prev) => (prev === 0 ? 11 : prev - 1));
    if (currentMonthIndex === 0) {
      setCurrentYear((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setCurrentMonthIndex((prev) => (prev === 11 ? 0 : prev + 1));
    if (currentMonthIndex === 11) {
      setCurrentYear((prev) => prev + 1);
    }
  };

  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      handlePrevMonth();
    } else {
      handleNextMonth();
    }
  };

  const handleYearClick = () => {
    // For now, just toggle the year dropdown or increment/decrement
    // In a full implementation, this could open a year selector
    const newYear = currentYear + 1;
    setCurrentYear(newYear);
    setCurrentMonth(new Date(newYear, currentMonthIndex, 1));
  };

  const days = getDaysArray();

  return (
    <div className="date-picker-wrapper" ref={pickerRef}>
      <div className="date-input-container" onClick={() => setIsOpen(!isOpen)}>
        <input
          type="text"
          readOnly
          value={selectedDate ? formatDisplayDate(selectedDate) : ''}
          placeholder={placeholder}
          className="date-input-text"
        />
        {!selectedDate && <span className="date-placeholder-text">{placeholder}</span>}
        <div className="date-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11Z" fill="#ADAEBC"/>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="date-picker-dropdown">
          <div className="calendar-header">
            <div className="year-selector" onClick={handleYearClick}>
              <span>{currentYear}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8L8 4L12 8" stroke="#424242" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="month-selector">
              <button onClick={() => handleMonthChange('prev')} className="month-nav-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="#424242" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span>{monthNames[currentMonthIndex]}</span>
              <button onClick={() => handleMonthChange('next')} className="month-nav-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="#424242" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="calendar-weekdays">
            {dayNames.map((day) => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {days.map((dayObj, index) => {
              const isSelected = selectedDate && isSameDay(dayObj.date, selectedDate);
              const isCurrentDay = isToday(dayObj.date);
              const isActive = dayObj.isCurrentMonth && !dayObj.isPast;
              
              return (
                <div
                  key={index}
                  className={`calendar-day ${
                    !dayObj.isCurrentMonth ? 'other-month' : ''
                  } ${dayObj.isPast ? 'past' : ''} ${
                    isCurrentDay ? 'today' : ''
                  } ${isSelected ? 'selected' : ''} ${
                    isActive ? 'active' : ''
                  }`}
                  onClick={() => dayObj.isCurrentMonth && !dayObj.isPast && handleDateClick(dayObj.date)}
                >
                  {dayObj.date.getDate()}
                </div>
              );
            })}
          </div>

          <div className="calendar-footer">
            <button onClick={handleCancel} className="calendar-btn cancel-btn">Cancel</button>
            <button onClick={handleDone} className="calendar-btn done-btn">Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;

