import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatSeatNumbers } from '../utils/seatFormatter';
import { getBooking, getTrip } from '../utils/api';
import { toast } from 'react-toastify';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking: stateBooking, trip: stateTrip, selectedSeats: stateSeats, userInfo } = location.state || {};
  const [showDownloadToast, setShowDownloadToast] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [booking, setBooking] = useState(stateBooking);
  const [trip, setTrip] = useState(stateTrip);
  const [selectedSeats, setSelectedSeats] = useState(stateSeats);
  const [loading, setLoading] = useState(!stateBooking || !stateTrip);

  useEffect(() => {
    const fetchBookingData = async () => {
      if (stateBooking && stateTrip) {
        setBooking(stateBooking);
        setTrip(stateTrip);
        setSelectedSeats(stateSeats || stateBooking.seats || []);
        setLoading(false);
        return;
      }

      // Try to fetch booking from URL params or localStorage
      const bookingId = new URLSearchParams(location.search).get('bookingId') || 
                       localStorage.getItem('lastBookingId');
      
      if (bookingId) {
        try {
          setLoading(true);
          const bookingResponse = await getBooking(bookingId);
          if (bookingResponse?.data?.success && bookingResponse.data.data) {
            const fetchedBooking = bookingResponse.data.data;
            setBooking(fetchedBooking);
            
            // Fetch trip details
            if (fetchedBooking.trip) {
              const tripResponse = await getTrip(fetchedBooking.trip);
              if (tripResponse?.data?.success && tripResponse.data.data) {
                setTrip(tripResponse.data.data);
                setSelectedSeats(fetchedBooking.seats || []);
                setLoading(false);
                return;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching booking:', error);
          toast.error('Failed to load booking details');
        }
      }
      
      if (!stateBooking && !stateTrip && !bookingId) {
        toast.error('Booking information not found. Redirecting to home...');
        setTimeout(() => navigate('/'), 2000);
      }
      setLoading(false);
    };

    fetchBookingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateBooking, stateTrip, stateSeats, location.search]);

  if (loading) {
    return (
      <div className="confirmation-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div>Loading booking confirmation...</div>
      </div>
    );
  }

  if (!booking || !trip) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const loadScript = (url) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve(true);
        script.onerror = (e) => reject(e);
        document.body.appendChild(script);
    });
};


  const generateBookingId = () => {
    const idPart = booking._id ? booking._id.slice(-6).toUpperCase() : 'XXXXXX';
    return `#TXN${idPart}`;
};

  const handleDownloadTicket = async () => {
    setIsDownloading(true);
    
    try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

        const input = document.querySelector('.ticket-card');

        if (!input) {
            toast.error('Ticket content not found for PDF generation.');
            setIsDownloading(false);
            return;
        }

        const canvas = await window.html2canvas(input, {
            scale: 3, 
            useCORS: true,
            allowTaint: true
        });

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4'); 
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        const fileName = `Ticket_${generateBookingId()}.pdf`;
        pdf.save(fileName);

        toast.success('Ticket downloaded successfully as PDF!');

    } catch (error) {
        console.error('PDF Generation Error:', error);
        toast.error('Failed to generate ticket PDF. Try "View Ticket" and print manually.'); 
    } finally {
        setIsDownloading(false);
    }
};

  const handleViewTicket = () => {
    handleDownloadTicket();
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(generateBookingId())}`;

  return (
    <div className="confirmation-container">
      <div className="confirmation-header">
        <div className="success-icon">
          <svg width="21" height="15" viewBox="0 0 21 15" fill="none">
            <path d="M1 7.5L7 13.5L20 1.5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="confirmation-title">Booking Confirmed!</h2>
        <p className="confirmation-subtitle">Your trip is successfully booked. Enjoy your journey!</p>
      </div>

      <div className="ticket-card">
        <div className="ticket-header">
          <div className="ticket-header-content">
            <h3 className="ticket-title">Flight Ticket</h3>
            <button className="ticket-print-btn">🖨️</button>
          </div>
          <p className="booking-id">Booking ID: {generateBookingId()}</p>
        </div>

        <div className="ticket-body">
          <div className="route-section">
            <div className="route-start">
              <div className="route-code">{trip.source.substring(0, 3).toUpperCase()}</div>
              <div className="route-name">{trip.source}</div>
              <div className="route-time">{trip.time}</div>
            </div>
            
            <div className="route-connector">
              <div className="connector-line"></div>
              <div className="connector-icon">✈️</div>
              <div className="connector-duration">2h 30min</div>
            </div>
            
            <div className="route-end">
              <div className="route-code">{trip.destination.substring(0, 3).toUpperCase()}</div>
              <div className="route-name">{trip.destination}</div>
              <div className="route-time">{trip.time}</div>
            </div>
          </div>

          <div className="ticket-info-grid">
            <div className="info-box">
              <div className="info-label">Date</div>
              <div className="info-value">{formatDate(trip.date)}</div>
            </div>
            <div className="info-box">
              <div className="info-label">Seats</div>
              <div className="info-value">{formatSeatNumbers(selectedSeats || booking.seats || [])}</div>
            </div>
          </div>

          <div className="ticket-divider"></div>

          <div className="ticket-total">
            <span className="total-label">Total Fare Paid</span>
            <span className="total-value">${booking.totalAmount.toFixed(2)}</span>
          </div>

          <div className="qr-section">
            <div className="qr-container">
              <img src={qrCodeUrl} alt="QR Code" className="qr-code" />
            </div>
            <p className="qr-instruction">Scan this QR code at the boarding gate</p>
          </div>

          <div className="ticket-actions">
          <button 
                                onClick={handleDownloadTicket} 
                                className="btn-download"
                                disabled={isDownloading}
                            >
                                <span>📥</span> {isDownloading ? 'Generating PDF...' : 'Download Ticket'}
                            </button>

            <button onClick={handleViewTicket} className="btn-view">
              <span>👁️</span> View Ticket
            </button>
          </div>
        </div>
      </div>

      {showDownloadToast && (
        <div className="download-toast">
          <div className="toast-icon">✓</div>
          <div className="toast-content">
            <div className="toast-title">Downloaded</div>
            <div className="toast-message">The ticket has been Downloaded</div>
          </div>
          <button 
            className="toast-close"
            onClick={() => setShowDownloadToast(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmation;

