import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserBookings, cancelBooking, getErrorMessage } from '../utils/api';
import { formatSeatNumbers } from '../utils/seatFormatter';
import { toast } from 'react-toastify';
import './MyBookings.css';

const MyBookings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getUserBookings();
      setBookings(response.data.data);
      
      // Scroll to booking if coming from checkout
      if (location.state?.bookingId) {
        setTimeout(() => {
          const element = document.getElementById(location.state.bookingId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleViewTicket = (booking) => {
    navigate('/booking-confirmation', {
      state: {
        booking,
        trip: booking.trip,
        selectedSeats: booking.seats,
        userInfo: {
          fullName: booking.user?.name || '',
          email: booking.user?.email || ''
        }
      }
    });
  };

  const formatBookingDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const getArrivalTime = (departureTime) => {
    if (!departureTime) return '';
    const [hours, mins] = departureTime.split(':');
    let hour24 = parseInt(hours);
    let newHour24 = hour24 + 2; // Add 2 hours for arrival
    if (newHour24 >= 24) {
      newHour24 = newHour24 - 24;
    }
    
    const hour12 = newHour24 > 12 ? newHour24 - 12 : (newHour24 === 0 ? 12 : newHour24);
    const period = newHour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${mins} ${period}`;
  };

  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return '';
    const [hours, mins] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 > 12 ? hour24 - 12 : (hour24 === 0 ? 12 : hour24);
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${mins} ${period}`;
  };

  const generateBookingId = (booking) => {
    return `SLK${booking._id.slice(-5)}`;
  };

  if (loading) {
    return (
      <div className="bookings-container">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <div className="bookings-content">
        {/* Upcoming Bookings */}
        <div className="bookings-section">
          <h3 className="section-title">Upcoming Bookings</h3>
          {bookings.upcoming && bookings.upcoming.length > 0 ? (
            <div className="bookings-grid upcoming-grid">
              {bookings.upcoming.map((booking) => (
                <div key={booking._id} id={booking._id} className="booking-card upcoming">
                  <div className="booking-card-header">
                    <div className="booking-header-left">
                      <div className="booking-id">Booking ID: {generateBookingId(booking)}</div>
                      <span className="booking-badge upcoming-badge">Upcoming</span>
                    </div>
                    <button className="booking-close-btn" onClick={() => handleCancel(booking._id)}>
                      <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
                        <path d="M1 1L19 17M19 1L1 17" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="booking-info">
                    <div className="info-row">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 0L10.472 5.528L16 8L10.472 10.472L8 16L5.528 10.472L0 8L5.528 5.528L8 0Z" fill="#9CA3AF"/>
                      </svg>
                      <span className="route-text">
                        {booking.trip?.source || 'N/A'} → {booking.trip?.destination || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="info-row">
                      <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                        <path d="M1 3L6 1L11 3V11L6 13L1 11V3Z" stroke="#9CA3AF" strokeWidth="1.5" fill="none"/>
                      </svg>
                      <span>{booking.trip?.date ? formatBookingDate(booking.trip.date) : 'N/A'}</span>
                    </div>
                    
                    <div className="info-row">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke="#9CA3AF" strokeWidth="1.5" fill="none"/>
                        <path d="M7 4V7L9 9" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span>
                        {booking.trip?.time ? `${formatTimeForDisplay(booking.trip.time)} - ${getArrivalTime(booking.trip.time)}` : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="info-row">
                      <span>Seats:</span>
                      <span className="seats-value">{booking.seats ? formatSeatNumbers(booking.seats) : 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="booking-action-area upcoming-action">
                    <button onClick={() => handleViewTicket(booking)} className="action-btn">
                      <svg width="27" height="24" viewBox="0 0 27 24" fill="none">
                        <path d="M0 0H27V24H0V0Z" fill="#2563EB"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-bookings">No upcoming bookings</p>
          )}
        </div>

        {/* Past Bookings */}
        <div className="bookings-section">
          <h3 className="section-title">Past Bookings</h3>
          {bookings.past && bookings.past.length > 0 ? (
            <div className="bookings-grid past-grid">
              {bookings.past.map((booking) => (
                <div key={booking._id} className="booking-card past">
                  <div className="booking-card-header">
                    <div className="booking-header-left">
                      <div className="booking-id">Booking ID: {generateBookingId(booking)}</div>
                      <span className="booking-badge completed-badge">Completed</span>
                    </div>
                    <button className="booking-close-btn" onClick={() => handleViewTicket(booking)}>
                      <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
                        <path d="M1 1L19 17M19 1L1 17" stroke="#16A34A" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="booking-info">
                    <div className="info-row">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 0L10.472 5.528L16 8L10.472 10.472L8 16L5.528 10.472L0 8L5.528 5.528L8 0Z" fill="#9CA3AF"/>
                      </svg>
                      <span className="route-text">
                        {booking.trip?.source || 'N/A'} → {booking.trip?.destination || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="info-row">
                      <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                        <path d="M1 3L6 1L11 3V11L6 13L1 11V3Z" stroke="#9CA3AF" strokeWidth="1.5" fill="none"/>
                      </svg>
                      <span>{booking.trip?.date ? formatBookingDate(booking.trip.date) : 'N/A'}</span>
                    </div>
                    
                    <div className="info-row">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke="#9CA3AF" strokeWidth="1.5" fill="none"/>
                        <path d="M7 4V7L9 9" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span>
                        {booking.trip?.time ? `${formatTimeForDisplay(booking.trip.time)} - ${getArrivalTime(booking.trip.time)}` : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="info-row">
                      <span>Seats:</span>
                      <span className="seats-value">{booking.seats ? formatSeatNumbers(booking.seats) : 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="booking-action-area completed-action">
                    <button onClick={() => handleViewTicket(booking)} className="action-btn">
                      <svg width="22" height="20" viewBox="0 0 22 20" fill="none">
                        <path d="M1.25 0L20 20H1.25V0Z" fill="#16A34A"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-bookings">No past bookings</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
