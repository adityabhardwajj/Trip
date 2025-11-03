import { useState, useEffect } from 'react';
import { getTrips, createTrip, updateTrip, deleteTrip, getBookings, getErrorMessage } from '../utils/api';
import { formatSeatNumbers } from '../utils/seatFormatter';
import { toast } from 'react-toastify';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTripTab, setActiveTripTab] = useState('all'); // 'all' or 'add'
  const [activeBookingTab, setActiveBookingTab] = useState('all'); // 'all' or 'verify'
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalBookings: 0,
    upcomingDepartures: 0
  });
  
  const [tripForm, setTripForm] = useState({
    source: '',
    destination: '',
    date: '',
    time: '',
    price: '',
    totalSeats: ''
  });

  useEffect(() => {
    fetchTrips();
    fetchBookings();
  }, []);

  useEffect(() => {
    if (activeTripTab === 'all') {
      fetchTrips();
    }
    if (activeBookingTab === 'all') {
      fetchBookings();
    }
  }, [activeTripTab, activeBookingTab]);

  useEffect(() => {
    calculateStats();
  }, [trips, bookings]);

  const calculateStats = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const upcomingTrips = trips.filter(trip => {
      const tripDate = new Date(trip.date);
      tripDate.setHours(0, 0, 0, 0);
      return tripDate >= now;
    });
    setStats({
      totalTrips: trips.length,
      totalBookings: bookings.length,
      upcomingDepartures: upcomingTrips.length
    });
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await getTrips();
      setTrips(response.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getBookings();
      setBookings(response.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setTripForm({
      ...tripForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const tripData = {
        source: tripForm.source.trim(),
        destination: tripForm.destination.trim(),
        date: tripForm.date,
        time: tripForm.time,
        price: parseFloat(tripForm.price),
        totalSeats: parseInt(tripForm.totalSeats)
      };

      if (editingTrip) {
        await updateTrip(editingTrip._id, tripData);
        toast.success('Trip updated successfully');
      } else {
        await createTrip(tripData);
        toast.success('Trip added successfully');
      }

      setTripForm({
        source: '',
        destination: '',
        date: '',
        time: '',
        price: '',
        totalSeats: ''
      });
      setEditingTrip(null);
      setShowAddModal(false);

      await fetchTrips();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setTripForm({
      source: trip.source,
      destination: trip.destination,
      date: new Date(trip.date).toISOString().split('T')[0],
      time: trip.time,
      price: trip.price.toString(),
      totalSeats: trip.totalSeats.toString()
    });
    setShowAddModal(true);
  };

  const handleDelete = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteTrip(tripId);
      toast.success('Trip deleted successfully');
      await fetchTrips();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingTrip(null);
    setTripForm({
      source: '',
      destination: '',
      date: '',
      time: '',
      price: '',
      totalSeats: ''
    });
    setShowAddModal(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatBookingDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const generateTripId = (index) => {
    return `T${String(index + 1).padStart(3, '0')}`;
  };

  const generateBookingId = (booking, index) => {
    return `B${String(1001 + index).padStart(4, '0')}`;
  };

  const getArrivalTime = (departureTime) => {
    if (!departureTime) return 'N/A';
    const [hours, mins] = departureTime.split(':');
    let hour24 = parseInt(hours);
    let newHour24 = hour24 + 2;
    if (newHour24 >= 24) {
      newHour24 = newHour24 - 24;
    }
    
    const hour12 = newHour24 > 12 ? newHour24 - 12 : (newHour24 === 0 ? 12 : newHour24);
    const period = newHour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${mins} ${period}`;
  };

  return (
    <div className="admin-panel-container">
      <h2 className="admin-title">Admin Dashboard</h2>
      
      <div className="admin-overview">
        <h3 className="overview-title">Admin Overview</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                <path d="M0.5 0L9.5 0V16H0.5V0Z" fill="#2563EB"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalTrips}</div>
              <div className="stat-label">Total Trips</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                <path d="M0 0H20V16H0V0Z" fill="#16A34A"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalBookings}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M0 0H16V16H0V0Z" fill="#CA8A04"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.upcomingDepartures}</div>
              <div className="stat-label">Upcoming Departures</div>
            </div>
          </div>
        </div>
      </div>

      <div className="management-section">
        <div className="section-header">
          <h3 className="section-title">Trip Management</h3>
          <div className="section-tabs">
            <button
              className={`tab-btn ${activeTripTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTripTab('all')}
            >
              All Trips
            </button>
            <button
              className={`tab-btn ${activeTripTab === 'add' ? 'active' : ''}`}
              onClick={() => {
                setActiveTripTab('add');
                setShowAddModal(true);
              }}
            >
              <span>+</span> Add New Trip
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Route</th>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Price</th>
                <th>Seats</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading trips...
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    No trips found. Add a new trip to get started.
                  </td>
                </tr>
              ) : (
                trips.map((trip, index) => (
                  <tr key={trip._id}>
                    <td>{generateTripId(index)}</td>
                    <td>
                      <span className="badge bus">Bus</span>
                    </td>
                    <td>{trip.source} to {trip.destination}</td>
                    <td>{trip.time}</td>
                    <td>{getArrivalTime(trip.time)}</td>
                    <td className="price-cell">${trip.price.toFixed(2)}</td>
                    <td>{trip.availableSeats || trip.totalSeats}{trip.availableSeats !== trip.totalSeats ? `/${trip.totalSeats}` : ''}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(trip)}
                          className="btn-icon edit"
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 0L16 8L8 16L0 8L8 0Z" fill="#4B5563"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(trip._id)}
                          className="btn-icon delete"
                          title="Delete"
                        >
                          <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                            <path d="M0 0H14V16H0V0Z" fill="#DC2626"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="management-section">
        <div className="section-header">
          <h3 className="section-title">Booking Management</h3>
          <div className="section-tabs">
            <button
              className={`tab-btn ${activeBookingTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveBookingTab('all')}
            >
              All Bookings
            </button>
            <button
              className={`tab-btn ${activeBookingTab === 'verify' ? 'active' : ''}`}
              onClick={() => setActiveBookingTab('verify')}
            >
              <span>✓</span> Verify QR
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>User</th>
                <th>Trip Route</th>
                <th>Date</th>
                <th>Seats</th>
                <th>Status</th>
                <th>QR Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking, index) => (
                  <tr key={booking._id}>
                    <td>{generateBookingId(booking, index)}</td>
                    <td>{booking.user?.name || 'N/A'}</td>
                    <td>
                      {booking.trip?.source || 'N/A'} to {booking.trip?.destination || 'N/A'}
                    </td>
                    <td>{booking.trip?.date ? formatBookingDate(booking.trip.date) : 'N/A'}</td>
                    <td>{booking.seats ? formatSeatNumbers(booking.seats) : 'N/A'}</td>
                    <td>
                      <span className={`badge ${booking.status === 'confirmed' ? 'confirmed' : 'pending'}`}>
                        {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {booking.status === 'confirmed' ? (
                        <div className="qr-verified">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="8" fill="#16A34A"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="qr-unverified"></div>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(booking.trip)}
                          className="btn-icon edit"
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 0L16 8L8 16L0 8L8 0Z" fill="#4B5563"/>
                          </svg>
                        </button>
                        <button
                          className="btn-icon delete"
                          title="Delete"
                        >
                          <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                            <path d="M0 0H14V16H0V0Z" fill="#DC2626"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Trip Details</h3>
            </div>
            <form onSubmit={handleSubmit} className="trip-form-modal">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="source">From</label>
                  <input
                    type="text"
                    id="source"
                    name="source"
                    value={tripForm.source}
                    onChange={handleInputChange}
                    placeholder="Departure Location"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="destination">To</label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={tripForm.destination}
                    onChange={handleInputChange}
                    placeholder="Arrival Destination"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={tripForm.date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="time">Time</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={tripForm.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="price">Price</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={tripForm.price}
                  onChange={handleInputChange}
                  placeholder="Price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="totalSeats">Total Seats</label>
                <input
                  type="number"
                  id="totalSeats"
                  name="totalSeats"
                  value={tripForm.totalSeats}
                  onChange={handleInputChange}
                  placeholder="Total no. of seats"
                  min="1"
                  required
                />
                
                {tripForm.totalSeats && parseInt(tripForm.totalSeats) > 0 && (
                  <div className="seat-selection-preview">
                    <div className="seat-section-label">Deluxe Cabin</div>
                    <div className="seat-grid-container">
                      <SeatGrid totalSeats={parseInt(tripForm.totalSeats)} />
                    </div>
                    <div className="seat-legend">
                      <div className="legend-item">
                        <div className="legend-box available"></div>
                        <span>Available</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-box booked"></div>
                        <span>Booked</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-box selected"></div>
                        <span>Selected</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="btn-submit-modal" disabled={loading}>
                {loading ? 'Saving...' : editingTrip ? 'Update Trip' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SeatGrid = ({ totalSeats }) => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const colsPerRow = 6;
  const totalGridSeats = rows.length * colsPerRow;
  const seatsToShow = Math.min(totalSeats, totalGridSeats);

  const renderSeats = () => {
    const seatArray = [];
    let seatNumber = 1;

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const rowSeats = [];
      for (let colIndex = 0; colIndex < colsPerRow; colIndex++) {
        if (seatNumber <= seatsToShow) {
          const seatId = `${rows[rowIndex]}${colIndex + 1}`;
          rowSeats.push(
            <div key={seatId} className="seat-box available">
              {seatId}
            </div>
          );
          seatNumber++;
        } else {
          rowSeats.push(<div key={`empty-${colIndex}`} className="seat-box empty"></div>);
        }
      }
      seatArray.push(
        <div key={rows[rowIndex]} className="seat-row">
          {rowSeats}
        </div>
      );
    }

    return seatArray;
  };

  return (
    <div className="seat-grid">
      {renderSeats()}
    </div>
  );
};

export default AdminPanel;
