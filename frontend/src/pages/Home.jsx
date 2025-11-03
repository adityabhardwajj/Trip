import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrips, getErrorMessage } from '../utils/api';
import { toast } from 'react-toastify';
import DatePicker from '../components/DatePicker';
import './Home.css';

const Home = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    source: '',
    destination: '',
    date: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async (searchFilters = {}) => {
    try {
      setLoading(true);
      const response = await getTrips(searchFilters);
      setTrips(response.data.data || []);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrips(filters);
  };

  const handleBookNow = (tripId) => {
    navigate(`/trip/${tripId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get trip image based on route
  const getTripImage = (source, destination) => {
    const route = `${source}-${destination}`.toLowerCase();
    const images = {
      'new york-boston': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=250&fit=crop',
      'boston-new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=250&fit=crop',
      'chicago-los angeles': 'https://images.unsplash.com/photo-1515896656393-4d5152a4cc6f?w=400&h=250&fit=crop',
      'atlanta-miami': 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=250&fit=crop',
      'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop'
    };
    return images[route] || images['default'];
  };

  // Helper function to calculate duration (simple estimate based on distance)
  const getTripDuration = (source, destination) => {
    const routes = {
      'new york-boston': '4h 30min',
      'boston-new york': '4h 30min',
      'chicago-los angeles': '5h 45min',
      'atlanta-miami': '2h 15min'
    };
    const route = `${source}-${destination}`.toLowerCase();
    return routes[route] || '3h 00min';
  };

  // Helper function to get rating and reviews
  const getRating = (trip) => {
    // This would ideally come from the backend, but for now we'll use sample data
    const ratings = {
      'new york-boston': { rating: 5, reviews: 124 },
      'boston-new york': { rating: 5, reviews: 124 },
      'chicago-los angeles': { rating: 4.5, reviews: 89 },
      'atlanta-miami': { rating: 5, reviews: 156 }
    };
    const route = `${trip.source}-${trip.destination}`.toLowerCase();
    return ratings[route] || { rating: 4.5, reviews: 0 };
  };

  // Helper function to check if trip is popular or has discount
  const getTripLabels = (trip) => {
    const labels = [];
    const route = `${trip.source}-${trip.destination}`.toLowerCase();
    
    if (route.includes('new york') && route.includes('boston')) {
      labels.push({ type: 'popular', text: 'Popular' });
      labels.push({ type: 'discount', text: '25% OFF' });
    } else if (route.includes('chicago') && route.includes('los angeles')) {
      labels.push({ type: 'discount', text: '21% OFF' });
    }
    
    return labels;
  };

  // Helper function to calculate original price if discounted
  const getPricing = (trip) => {
    const labels = getTripLabels(trip);
    const discountLabel = labels.find(l => l.type === 'discount');
    
    if (discountLabel) {
      const discountPercent = parseFloat(discountLabel.text.replace('% OFF', ''));
      const originalPrice = Math.round(trip.price / (1 - discountPercent / 100));
      return { currentPrice: trip.price, originalPrice };
    }
    
    return { currentPrice: trip.price, originalPrice: null };
  };

  return (
    <div className="home-container">
      {/* Hero Section with Search */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Find Your Next Journey</h1>
            <p className="hero-subtitle">Discover available trips and book your seats with ease.</p>
          </div>

          <div className="search-card">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-form-content">
                {/* From Field */}
                <div className="search-field-wrapper">
                  <label className="field-label">From</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="source"
                      value={filters.source}
                      onChange={handleFilterChange}
                      placeholder="Departure Location"
                      className="search-input"
                    />
                    <div className="input-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#ADAEBC"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* To Field */}
                <div className="search-field-wrapper">
                  <label className="field-label">To</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="destination"
                      value={filters.destination}
                      onChange={handleFilterChange}
                      placeholder="Arrival Location"
                      className="search-input"
                    />
                    <div className="input-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#ADAEBC"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Date Field */}
                <div className="search-field-wrapper date-field">
                  <label className="field-label">Date</label>
                  <div className="input-wrapper date-input-wrapper">
                    <DatePicker
                      value={filters.date}
                      onChange={(date) => setFilters({ ...filters, date })}
                      placeholder="mm/dd/yyyy"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <button type="submit" className="search-btn">
                  Search Trips
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Trips Section */}
      <div className="trips-section">
        <div className="section-header">
          <h2 className="section-title">Available Trips</h2>
          <p className="section-subtitle">Choose from our carefully selected destinations and enjoy a comfortable journey.</p>
        </div>
        {loading ? (
          <div className="loading">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="no-trips">
            <p>No trips available. Please check back later or try different filters.</p>
            {filters.source || filters.destination || filters.date ? (
              <button onClick={() => {
                setFilters({ source: '', destination: '', date: '' });
                fetchTrips();
              }} className="clear-filters-btn">
                Clear Filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="trips-grid">
            {trips.map((trip) => {
              const tripImage = getTripImage(trip.source, trip.destination);
              const duration = getTripDuration(trip.source, trip.destination);
              const { rating, reviews } = getRating(trip);
              const labels = getTripLabels(trip);
              const { currentPrice, originalPrice } = getPricing(trip);
              const availableSeats = trip.availableSeats || trip.totalSeats || 0;

              return (
                <div key={trip._id} className="trip-card">
                  {/* Trip Image */}
                  <div className="trip-image-container">
                    <img src={tripImage} alt={`${trip.source} to ${trip.destination}`} className="trip-image" />
                    {/* Labels */}
                    <div className="trip-labels">
                      {labels.map((label, index) => (
                        <span key={index} className={`trip-label ${label.type}`}>
                          {label.text}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="trip-rating">
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const filled = star <= rating;
                        return (
                          <svg
                            key={star}
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              d="M8 0L10.163 5.53L16 6.122L11.854 10.03L12.979 16L8 12.73L3.021 16L4.146 10.03L0 6.122L5.837 5.53L8 0Z" 
                              fill={filled ? '#FCD34D' : '#E5E7EB'}
                            />
                          </svg>
                        );
                      })}
                    </div>
                    <span className="reviews-count">({reviews} reviews)</span>
                  </div>

                  {/* Route */}
                  <div className="trip-route">
                    {trip.source} → {trip.destination}
                  </div>

                  {/* Trip Details */}
                  <div className="trip-details">
                    <div className="trip-detail-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C11.31 2 14 4.69 14 8C14 11.31 11.31 14 8 14ZM8.5 4H7V9L11.25 11.15L12 10.08L8.5 8.25V4Z" fill="#6B7280"/>
                      </svg>
                      <span>{duration}</span>
                    </div>
                    <div className="trip-detail-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 8C9.657 8 11 6.657 11 5C11 3.343 9.657 2 8 2C6.343 2 5 3.343 5 5C5 6.657 6.343 8 8 8ZM8 9C6.067 9 2 9.933 2 12V14H14V12C14 9.933 9.933 9 8 9Z" fill="#6B7280"/>
                      </svg>
                      <span>{availableSeats} seats available</span>
                    </div>
                    <div className="trip-detail-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2H4C2.9 2 2 2.9 2 4V14C2 15.1 2.9 16 4 16H12C13.1 16 14 15.1 14 14V4C14 2.9 13.1 2 12 2ZM12 14H4V7H12V14ZM4 5H12V4H4V5Z" fill="#6B7280"/>
                      </svg>
                      <span>{formatDate(trip.date)}</span>
                    </div>
                  </div>

                  {/* Price and Book Button */}
                  <div className="trip-footer">
                    <div className="trip-price">
                      <span className="current-price">${currentPrice}</span>
                      {originalPrice && (
                        <span className="original-price">${originalPrice}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleBookNow(trip._id)}
                      className="book-btn"
                      disabled={availableSeats === 0}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
