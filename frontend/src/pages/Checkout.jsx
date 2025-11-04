import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBooking, getErrorMessage } from '../utils/api';
import { formatSeatNumbers, formatSeatNumber } from '../utils/seatFormatter';
import { toast } from 'react-toastify';
import './Checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { trip, selectedSeats } = location.state || {};

  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  
  const RAZORPAY_PAYMENT_LINK = 'https://razorpay.me/@adityabhardwaj6392';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!trip || !selectedSeats || selectedSeats.length === 0) {
      toast.error('Invalid booking data');
      navigate('/');
      return;
    }

    console.log('Checkout - Received from TripDetails:', {
      tripId: trip._id,
      selectedSeats,
      selectedSeatsFormatted: formatSeatNumbers(selectedSeats)
    });
  }, [isAuthenticated, trip, selectedSeats, navigate, user]);

  if (!trip || !selectedSeats) {
    return null;
  }

  const totalAmount = selectedSeats.length * trip.price;

  const handleUserInfoChange = (e) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleCardDetailsChange = (e) => {
    let value = e.target.value;
    
    if (e.target.name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    }
    
    if (e.target.name === 'expiryDate') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
    }

    setCardDetails({
      ...cardDetails,
      [e.target.name]: value
    });
  };

  const handleRazorpayPayment = async (bookingData) => {
    const totalAmount = selectedSeats.length * trip.price;
    
    const proceed = window.confirm(
      `You will be redirected to Razorpay to complete payment of ₹${totalAmount.toFixed(2)}.\n\nAfter completing the payment, please return to this page to confirm your booking.`
    );
    
    if (!proceed) {
      return;
    }

    setLoading(true);
    
    const paymentWindow = window.open(
      `${RAZORPAY_PAYMENT_LINK}?amount=${totalAmount * 100}&currency=INR&description=Trip Booking: ${trip.source} to ${trip.destination}`,
      '_blank',
      'width=600,height=700'
    );

    const checkPayment = setInterval(() => {
      if (paymentWindow.closed) {
        clearInterval(checkPayment);
        setLoading(false);
        
        const paymentConfirmed = window.confirm(
          'Have you completed the payment on Razorpay?\n\nClick OK to confirm your booking.'
        );
        
        if (paymentConfirmed) {
          handlePaymentSuccess(bookingData);
        } else {
          toast.info('Please complete the payment to proceed with booking.');
        }
      }
    }, 1000);

    return true;
  };

  const handlePaymentSuccess = async (bookingData) => {
    try {
      setLoading(true);
      const response = await createBooking(bookingData);
      
      if (response && response.data && response.data.success && response.data.data) {
        const bookingData = response.data.data;
        // Store booking ID in localStorage as backup
        if (bookingData._id) {
          localStorage.setItem('lastBookingId', bookingData._id);
        }
        
        toast.success('Payment successful! Booking confirmed.');
        
        setTimeout(() => {
          navigate('/booking-confirmation', {
            state: { 
              booking: bookingData,
              trip,
              selectedSeats,
              userInfo
            },
            replace: true
          });
        }, 500);
      } else {
        toast.error('Booking confirmation failed. Please contact support.');
        console.error('Unexpected booking response:', response);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage || 'Booking confirmation failed. Please contact support.');
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!userInfo.fullName || !userInfo.email || !userInfo.phoneNumber) {
      toast.error('Please fill in all contact details');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userInfo.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (userInfo.phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (paymentMethod === 'card') {
      const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
      if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
        toast.error('Please enter a valid card number');
        return;
      }
      if (!cardDetails.cardholderName || cardDetails.cardholderName.trim().length < 2) {
        toast.error('Please enter cardholder name');
        return;
      }
      if (!cardDetails.expiryDate || cardDetails.expiryDate.length !== 5) {
        toast.error('Please enter a valid expiry date (MM/YY)');
        return;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4) {
        toast.error('Please enter a valid CVV');
        return;
      }
    }
    
    if (paymentMethod === 'razorpay') {
      const seatsToSend = selectedSeats.map(s => typeof s === 'string' ? parseInt(s, 10) : s).filter(s => !isNaN(s));
      
      const bookingPayload = {
        tripId: trip._id,
        seats: seatsToSend,
        paymentMethod: 'razorpay'
      };
      
      await handleRazorpayPayment(bookingPayload);
      return;
    }

    try {
      setLoading(true);
      
      const seatsToSend = selectedSeats.map(s => typeof s === 'string' ? parseInt(s, 10) : s).filter(s => !isNaN(s));
      
      console.log('Checkout - Sending booking request with:', {
        tripId: trip._id,
        selectedSeatsOriginal: selectedSeats,
        seats: seatsToSend,
        seatsFormatted: seatsToSend.map(s => formatSeatNumber(s)),
        seatsArrayDetails: {
          length: seatsToSend.length,
          values: [...seatsToSend],
          typeCheck: seatsToSend.map(s => ({ value: s, type: typeof s }))
        },
        paymentMethod
      });
      
      const bookingPayload = {
        tripId: trip._id,
        seats: seatsToSend,
        paymentMethod
      };
      
      console.log('Checkout - Full booking payload:', JSON.stringify(bookingPayload, null, 2));
      
      const response = await createBooking(bookingPayload);

      if (response && response.data && response.data.success && response.data.data) {
        const bookingData = response.data.data;
        // Store booking ID in localStorage as backup
        if (bookingData._id) {
          localStorage.setItem('lastBookingId', bookingData._id);
        }
        
        toast.success(response.data.message || 'Booking confirmed! Redirecting...');
        
        setTimeout(() => {
          navigate('/booking-confirmation', {
            state: { 
              booking: bookingData,
              trip,
              selectedSeats,
              userInfo
            },
            replace: true
          });
        }, 500);
      } else {
        const errorMsg = response?.data?.message || 'Booking failed. Please try again.';
        toast.error(errorMsg);
        console.error('Unexpected booking response:', response);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      
      const isRealError = error.response && error.response.status >= 400;
      
      if (isRealError) {
        toast.error(errorMessage);
        
        if (errorMessage.includes('already booked') || 
            errorMessage.includes('not available') ||
            errorMessage.includes('Not enough seats')) {
          setTimeout(() => {
            navigate(`/trip/${trip._id}`);
          }, 2000);
        }
      } else {
        console.error('Booking error:', error);
        toast.error(errorMessage || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${period}`;
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout & Payment</h2>
      
      <div className="checkout-content">
        <div className="checkout-left">
          <div className="info-card">
            <h3 className="card-title">Your Information</h3>
            <p className="card-subtitle">Please provide your contact details for this booking</p>
            
            <form className="form-fields" autoComplete="on">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  value={userInfo.fullName}
                  onChange={handleUserInfoChange}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={userInfo.email}
                  onChange={handleUserInfoChange}
                  placeholder="Enter your email address"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  autoComplete="tel"
                  value={userInfo.phoneNumber}
                  onChange={handleUserInfoChange}
                  placeholder="Enter your phone number"
                />
              </div>
            </form>
          </div>

          <div className="payment-card">
            <h3 className="card-title">Payment Method</h3>
            
            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-option-icon">
                  <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 16H0V0H18V16Z" stroke="#E5E7EB"/>
                    <path d="M2 1C0.896875 1 0 1.89688 0 3V4H18V3C18 1.89688 17.1031 1 16 1H2ZM18 7H0V13C0 14.1031 0.896875 15 2 15H16C17.1031 15 18 14.1031 18 13V7ZM3.5 11H5.5C5.775 11 6 11.225 6 11.5C6 11.775 5.775 12 5.5 12H3.5C3.225 12 3 11.775 3 11.5C3 11.225 3.225 11 3.5 11ZM7 11.5C7 11.225 7.225 11 7.5 11H11.5C11.775 11 12 11.225 12 11.5C12 11.775 11.775 12 11.5 12H7.5C7.225 12 7 11.775 7 11.5Z" fill={paymentMethod === 'card' ? '#2563EB' : '#9CA3AF'}/>
                  </svg>
                </div>
                <span>Credit or Debit Card</span>
              </label>
              
              <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-option-icon wallet-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C14.2091 0 16 1.79086 16 4V12C16 14.2091 14.2091 16 12 16H4C1.79086 16 0 14.2091 0 12V4C0 1.79086 1.79086 0 4 0H12Z" fill={paymentMethod === 'upi' ? 'url(#paint0_linear_wallet)' : '#9CA3AF'}/>
                    <path d="M12 0C14.2091 0 16 1.79086 16 4V12C16 14.2091 14.2091 16 12 16H4C1.79086 16 0 14.2091 0 12V4C0 1.79086 1.79086 0 4 0H12Z" stroke="#E5E7EB"/>
                    <defs>
                      <linearGradient id="paint0_linear_wallet" x1="0" y1="8" x2="16" y2="8" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3B82F6"/>
                        <stop offset="1" stopColor="#9333EA"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span>Digital Wallet (e.g., PayPal, Apple Pay)</span>
              </label>
              
              <label className={`payment-option ${paymentMethod === 'razorpay' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-option-icon razorpay-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="16" height="16" rx="4" fill={paymentMethod === 'razorpay' ? '#326CF9' : '#9CA3AF'}/>
                    <path d="M8 4L10 6L6 10L4 8L8 4Z" fill="white"/>
                    <path d="M8 12L10 10L6 6L4 8L8 12Z" fill="white"/>
                  </svg>
                </div>
                <span>Razorpay (UPI, Cards, Wallets)</span>
              </label>
              
              <label className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-option-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0L9.5 5.5H14L10 9L11.5 14.5L8 11L4.5 14.5L6 9L2 5.5H6.5L8 0Z" fill={paymentMethod === 'cash' ? '#16A34A' : '#9CA3AF'}/>
                  </svg>
                </div>
                <span>Cash on Board</span>
              </label>
            </div>

            {paymentMethod === 'razorpay' && (
              <div className="razorpay-info">
                <div className="info-box">
                  <p>You will be redirected to Razorpay secure payment gateway to complete your payment.</p>
                  <p className="info-note">Razorpay supports UPI, Credit/Debit Cards, Net Banking, and Wallets.</p>
                </div>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="razorpay-info">
                <div className="info-box">
                  <p>You can pay in cash when you board the bus. Your booking will be confirmed immediately.</p>
                  <p className="info-note">Please have the exact amount ready: ${totalAmount.toFixed(2)}</p>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="card-form">
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    autoComplete="cc-number"
                    value={cardDetails.cardNumber}
                    onChange={handleCardDetailsChange}
                    placeholder="Enter card number"
                    maxLength={19}
                    inputMode="numeric"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cardholderName">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardholderName"
                    name="cardholderName"
                    autoComplete="cc-name"
                    value={cardDetails.cardholderName}
                    onChange={handleCardDetailsChange}
                    placeholder="Enter cardholder name"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      autoComplete="cc-exp"
                      value={cardDetails.expiryDate}
                      onChange={handleCardDetailsChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      autoComplete="cc-csc"
                      value={cardDetails.cvv}
                      onChange={handleCardDetailsChange}
                      placeholder="CVV"
                      maxLength={4}
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="booking-summary-card">
          <h3 className="card-title">Booking Summary</h3>
          
          <div className="summary-image">
          </div>
          
          <div className="summary-details">
            <div className="summary-row">
              <span className="summary-icon">📍</span>
              <span className="summary-label">Route:</span>
              <span className="summary-value">{trip.source} to {trip.destination}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-icon">📅</span>
              <span className="summary-label">Date:</span>
              <span className="summary-value">{formatDate(trip.date)}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-icon">🕐</span>
              <span className="summary-label">Time:</span>
              <span className="summary-value">{formatTime(trip.time)}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-icon">🚌</span>
              <span className="summary-label">Transport:</span>
              <span className="summary-value">Bus</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-icon">💺</span>
              <span className="summary-label">Seats:</span>
              <span className="summary-value">{formatSeatNumbers(selectedSeats)}</span>
            </div>
          </div>
          
          <div className="summary-divider"></div>
          
          <div className="summary-total">
            <span className="total-label">Total Fare:</span>
            <span className="total-value">USD {totalAmount.toFixed(2)}</span>
          </div>
          
          <button
            onClick={handleBooking}
            className="complete-payment-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Complete Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
