import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatSeatNumbers } from '../utils/seatFormatter';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, trip, selectedSeats, userInfo } = location.state || {};
  const [showDownloadToast, setShowDownloadToast] = useState(false);

  useEffect(() => {
    if (!booking || !trip) {
      navigate('/');
    }
  }, [booking, trip, navigate]);

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

  const generateBookingId = () => {
    return `#TXN${booking._id.slice(-6).toUpperCase()}`;
  };

  const handleDownloadTicket = () => {
    // Generate ticket HTML
    const ticketContent = `
      <html>
        <head>
          <title>Flight Ticket</title>
          <style>
            body {
              font-family: 'Montserrat', Arial, sans-serif;
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
              background: #f9fafb;
            }
            .ticket {
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
            }
            .ticket-header {
              background: linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%);
              color: white;
              padding: 24px;
            }
            .ticket-body {
              padding: 32px;
            }
            .route-section {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin: 24px 0;
            }
            .route-code {
              font-size: 24px;
              font-weight: 600;
            }
            .route-name {
              color: #6B7280;
              font-size: 14px;
            }
            .route-time {
              color: #111827;
              font-size: 14px;
              font-weight: 500;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin: 24px 0;
            }
            .info-box {
              background: #F9FAFB;
              padding: 16px;
              border-radius: 8px;
            }
            .info-label {
              color: #6B7280;
              font-size: 14px;
            }
            .info-value {
              color: #111827;
              font-size: 16px;
              font-weight: 600;
              margin-top: 4px;
            }
            .total-section {
              border-top: 1px solid #E5E7EB;
              padding-top: 16px;
              margin-top: 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .total-label {
              font-size: 18px;
              font-weight: 600;
            }
            .total-value {
              font-size: 24px;
              font-weight: 700;
              color: #16A34A;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="ticket-header">
              <h2>Flight Ticket</h2>
              <p>Booking ID: ${generateBookingId()}</p>
            </div>
            <div class="ticket-body">
              <div class="route-section">
                <div>
                  <div class="route-code">${trip.source.substring(0, 3).toUpperCase()}</div>
                  <div class="route-name">${trip.source}</div>
                  <div class="route-time">${trip.time}</div>
                </div>
                <div style="text-align: center; flex: 1;">
                  <div style="border-top: 2px solid #D1D5DB; margin: 12px 20px; position: relative;">
                    <div style="position: absolute; left: 50%; top: -8px; transform: translateX(-50%); background: white; padding: 0 8px;">
                      ✈️
                    </div>
                  </div>
                  <div style="color: #6B7280; font-size: 12px;">2h 30min</div>
                </div>
                <div style="text-align: right;">
                  <div class="route-code">${trip.destination.substring(0, 3).toUpperCase()}</div>
                  <div class="route-name">${trip.destination}</div>
                  <div class="route-time">${trip.time}</div>
                </div>
              </div>
              
              <div class="info-grid">
                <div class="info-box">
                  <div class="info-label">Date</div>
                  <div class="info-value">${formatDate(trip.date)}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Seats</div>
                  <div class="info-value">${formatSeatNumbers(selectedSeats)}</div>
                </div>
              </div>
              
              <div class="total-section">
                <div class="total-label">Total Fare Paid</div>
                <div class="total-value">$${booking.totalAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(ticketContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Show download toast
    setShowDownloadToast(true);
    setTimeout(() => setShowDownloadToast(false), 3000);
  };

  const handleViewTicket = () => {
    handleDownloadTicket();
  };

  // Generate QR code placeholder (in production, use a QR code library)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${generateBookingId()}`;

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
              <div className="info-value">{formatSeatNumbers(selectedSeats)}</div>
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
            <button onClick={handleDownloadTicket} className="btn-download">
              <span>📥</span> Download Ticket
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

