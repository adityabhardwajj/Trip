import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTrip, getErrorMessage } from '../utils/api';
import { formatSeatNumber } from '../utils/seatFormatter';
import { toast } from 'react-toastify';
import './TripDetails.css';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [trip, setTrip] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await getTrip(id);
      console.log({response})
      setTrip(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatNumber) => {
    console.log('toggleSeat called with seatNumber:', seatNumber, 'Label:', formatSeatNumber(seatNumber));
    
    if (!isAuthenticated) {
      toast.error('Please login to book seats');
      navigate('/login');
      return;
    }

    if (selectedSeats.includes(seatNumber)) {
      console.log('Removing seat:', seatNumber);
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      if (!trip.seats || trip.seats.length === 0) {
        setSelectedSeats([...selectedSeats, seatNumber]);
        return;
      }
      
      const seat = trip.seats.find(s => s.number === seatNumber);
      
      if (!seat) {
        setSelectedSeats([...selectedSeats, seatNumber]);
        return;
      }
      
      if (seat.isBooked) {
        toast.error(`Seat ${formatSeatNumber(seatNumber)} is already booked`);
        return;
      }
      
      console.log('Adding seat:', seatNumber, 'Current selectedSeats:', selectedSeats);
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    console.log('handleProceed - selectedSeats:', selectedSeats, 'Formatted:', selectedSeats.map(s => formatSeatNumber(s)));

    navigate('/checkout', {
      state: {
        trip,
        selectedSeats
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="trip-details-container">Loading...</div>;
  }

  if (!trip) {
    return <div className="trip-details-container">Trip not found</div>;
  }

  const getSeatLabel = formatSeatNumber;

  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatsPerRow = 6;
  const totalColumns = 2;

  return (
    <div className="trip-details-container">
      <div className="trip-info-card">
        <img 
          className="trip-hero-image" 
          src={trip.image ?trip.image :  "https://placehold.co/1072x508" }
          alt={`${trip.source} to ${trip.destination}`}
        />
        
        <div className="trip-details-content">
          <h2 className="trip-details-title">Trip Details</h2>
          
          <div className="trip-info-grid">
            <div className="info-column">
              <div className="info-group">
                <div className="info-label-row">
                  <span className="info-label">From</span>
                </div>
                <div className="info-value-row">
                  <span className="info-value">{trip.source}</span>
                </div>
              </div>
              
              <div className="info-group">
                <div className="info-label-row">
                  <span className="info-label">Date</span>
                </div>
                <div className="info-value-row">
                  <span className="info-value">{formatDate(trip.date)}</span>
                </div>
              </div>
            </div>
            
            <div className="info-column info-column-right">
              <div className="info-group">
                <div className="info-label-row">
                  <span className="info-label">To</span>
                </div>
                <div className="info-value-row">
                  <span className="info-value">{trip.destination}</span>
                </div>
              </div>
              
              <div className="info-group">
                <div className="info-label-row">
                  <span className="info-label">Time</span>
                </div>
                <div className="info-value-row">
                  <span className="info-value">{trip.time}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="fare-section">
            <div className="fare-label">Fare per seat</div>
            <div className="fare-value">${trip.price.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="seat-selection-card">
        <h3 className="seat-selection-title">Select Your Seat</h3>
        
        <div className="seats-container-wrapper">
          <div className="cabin-label">Deluxe Cabin</div>
          
          <div className="seats-container">
            <div className="seats-container-inner">
              <div key="left-column" className="seat-column">
                {rows.map((rowLetter, rowIndex) => {
                  const baseSeat = rowIndex * seatsPerRow + 1;
                  const seat1Number = baseSeat;
                  const seat2Number = baseSeat + 1;
                  
                  if (seat1Number > trip.totalSeats && seat2Number > trip.totalSeats) return null;
                  
                  return (
                    <div key={`left-pair-${rowIndex}`} className="seat-pair">
                      {[seat1Number, seat2Number].map((seatNumber, pairIndex) => {
                        if (seatNumber > trip.totalSeats) return null;
                        
                        let isBooked = false;
                        if (trip.seats && trip.seats.length > 0) {
                          const seat = trip.seats.find(s => s.number === seatNumber);
                          isBooked = seat?.isBooked || false;
                        }
                        
                        const isSelected = selectedSeats.includes(seatNumber);
                        const seatLabel = getSeatLabel(seatNumber);
                        const buttonKey = `seat-left-${rowIndex}-${pairIndex}-${seatNumber}`;

                        return (
                          <button
                            key={buttonKey}
                            className={`seat ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Button clicked - seatNumber from closure:', seatNumber, 'Label:', seatLabel, 'Button key:', buttonKey);
                              toggleSeat(seatNumber);
                            }}
                            disabled={isBooked}
                            title={isBooked ? `Seat ${seatLabel} is already booked` : `Select seat ${seatLabel}`}
                            data-seat-number={seatNumber}
                            data-seat-label={seatLabel}
                          >
                            {seatLabel}
                            {isBooked && <span className="seat-booked-icon">✕</span>}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div key="aisle" className="aisle-separator">
                <div className="aisle-line"></div>
              </div>

              <div key="right-column" className="seat-column">
                {rows.map((rowLetter, rowIndex) => {
                  const baseSeat = rowIndex * seatsPerRow + 1;
                  const seat6Number = baseSeat + 5;
                  
                  if (seat6Number > trip.totalSeats) return null;
                  
                  let isBooked = false;
                  if (trip.seats && trip.seats.length > 0) {
                    const seat = trip.seats.find(s => s.number === seat6Number);
                    isBooked = seat?.isBooked || false;
                  }
                  
                  const isSelected = selectedSeats.includes(seat6Number);
                  const seatLabel = getSeatLabel(seat6Number);
                  const buttonKey = `seat-right-${rowIndex}-${seat6Number}`;

                  return (
                    <div key={`right-single-${rowIndex}`} className="seat-single">
                      <button
                        key={buttonKey}
                        className={`seat ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Button clicked - seatNumber from closure:', seat6Number, 'Label:', seatLabel, 'Button key:', buttonKey);
                          toggleSeat(seat6Number);
                        }}
                        disabled={isBooked}
                        title={isBooked ? `Seat ${seatLabel} is already booked` : `Select seat ${seatLabel}`}
                        data-seat-number={seat6Number}
                        data-seat-label={seatLabel}
                      >
                        {seatLabel}
                        {isBooked && <span className="seat-booked-icon">✕</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="seat-legend">
            <div className="legend-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 0.5H12C13.933 0.5 15.5 2.067 15.5 4V12C15.5 13.933 13.933 15.5 12 15.5H4C2.067 15.5 0.5 13.933 0.5 12V4C0.5 2.067 2.067 0.5 4 0.5Z" fill="#F3F4F6"/>
                <path d="M4 0.5H12C13.933 0.5 15.5 2.067 15.5 4V12C15.5 13.933 13.933 15.5 12 15.5H4C2.067 15.5 0.5 13.933 0.5 12V4C0.5 2.067 2.067 0.5 4 0.5Z" stroke="#E5E7EB"/>
              </svg>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 0.5H12C13.933 0.5 15.5 2.067 15.5 4V12C15.5 13.933 13.933 15.5 12 15.5H4C2.067 15.5 0.5 13.933 0.5 12V4C0.5 2.067 2.067 0.5 4 0.5Z" fill="#EF4444"/>
                <path d="M4 0.5H12C13.933 0.5 15.5 2.067 15.5 4V12C15.5 13.933 13.933 15.5 12 15.5H4C2.067 15.5 0.5 13.933 0.5 12V4C0.5 2.067 2.067 0.5 4 0.5Z" stroke="#DC2626" strokeWidth="1"/>
              </svg>
              <span>Booked</span>
            </div>
            <div className="legend-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 0.5H12C13.933 0.5 15.5 2.067 15.5 4V12C15.5 13.933 13.933 15.5 12 15.5H4C2.067 15.5 0.5 13.933 0.5 12V4C0.5 2.067 2.067 0.5 4 0.5Z" fill="#2563EB"/>
                <path d="M4 0.5H12C13.933 0.5 15.5 2.067 15.5 4V12C15.5 13.933 13.933 15.5 12 15.5H4C2.067 15.5 0.5 13.933 0.5 12V4C0.5 2.067 2.067 0.5 4 0.5Z" stroke="#E5E7EB"/>
              </svg>
              <span>Selected</span>
            </div>
          </div>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="selected-seats-card">
          <div className="selected-seats-card-content">
            <h3 className="selected-seats-title">Selected Seats</h3>
            <div className="selected-seats-list">
              {selectedSeats
                .sort((a, b) => a - b)
                .map(seatNumber => formatSeatNumber(seatNumber))
                .join(', ')}
            </div>
          </div>
        </div>
      )}

      <div className="confirm-booking-container">
        <button
          onClick={handleProceed}
          className="confirm-booking-btn"
          disabled={selectedSeats.length === 0}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default TripDetails;

