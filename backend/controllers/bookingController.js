import Booking from '../models/Booking.js';
import Trip from '../models/Trip.js';
import mongoose from 'mongoose';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  let session = null;
  let useTransaction = false;

  // Try to start a transaction (requires replica set)
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch (transactionError) {
    // If transactions not available (no replica set), proceed without transaction
    console.warn('Transactions not available, proceeding without transaction:', transactionError.message);
    useTransaction = false;
  }

  try {

    const { tripId, seats, paymentMethod } = req.body;
    const userId = req.user._id;

    // Debug: Log received seat numbers
    console.log('Booking request - Received seats:', seats, 'Trip ID:', tripId);
    
    // Ensure seats are numbers (not strings)
    const normalizedSeats = seats.map(s => typeof s === 'string' ? parseInt(s, 10) : s).filter(s => !isNaN(s));
    if (normalizedSeats.length !== seats.length) {
      if (useTransaction) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid seat numbers provided'
      });
    }

    // Validate input
    if (!normalizedSeats || !Array.isArray(normalizedSeats) || normalizedSeats.length === 0) {
      if (useTransaction) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({
        success: false,
        message: 'Please select at least one seat'
      });
    }

    // Use normalized seats from now on
    const seatsToBook = normalizedSeats;

    // Get trip with or without session
    let trip = useTransaction 
      ? await Trip.findById(tripId).session(session)
      : await Trip.findById(tripId);
    
    if (!trip) {
      if (useTransaction) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    // Debug: Log trip state
    console.log('Trip state - totalSeats:', trip.totalSeats, 'availableSeats:', trip.availableSeats, 'seats array length:', trip.seats?.length || 0);

    // Ensure seats array is initialized
    if (!trip.seats || trip.seats.length === 0) {
      trip.seats = [];
      for (let i = 1; i <= trip.totalSeats; i++) {
        trip.seats.push({
          number: i,
          isBooked: false,
          bookedBy: null
        });
      }
      trip.availableSeats = trip.totalSeats;
    } else if (trip.seats.length < trip.totalSeats) {
      // Ensure all seats from 1 to totalSeats exist
      const existingSeatNumbers = new Set(trip.seats.map(s => s.number));
      for (let i = 1; i <= trip.totalSeats; i++) {
        if (!existingSeatNumbers.has(i)) {
          trip.seats.push({
            number: i,
            isBooked: false,
            bookedBy: null
          });
        }
      }
      trip.seats.sort((a, b) => a.number - b.number);
      const bookedCount = trip.seats.filter(s => s.isBooked).length;
      trip.availableSeats = trip.totalSeats - bookedCount;
    }

    // Validate seat numbers are within range
    const invalidSeats = seatsToBook.filter(seatNum => seatNum < 1 || seatNum > trip.totalSeats);
    if (invalidSeats.length > 0) {
      if (useTransaction) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({
        success: false,
        message: `Invalid seat numbers: ${invalidSeats.join(', ')}`
      });
    }

    // Check if seats are available (using current trip state)
    const unavailableSeats = [];
    const seatFormatter = (num) => {
      const rowLetter = String.fromCharCode(65 + Math.floor((num - 1) / 6));
      const colNumber = ((num - 1) % 6) + 1;
      return `${rowLetter}${colNumber}`;
    };

    // Debug: Log seat array state
    console.log('Checking seat availability. Trip seats array:', {
      totalSeats: trip.totalSeats,
      seatsArrayLength: trip.seats?.length || 0,
      availableSeats: trip.availableSeats,
      seatsToBook: seatsToBook,
      firstFewSeats: trip.seats?.slice(0, 20).map(s => ({ number: s.number, isBooked: s.isBooked })) || 'no seats array'
    });

    // Validate each seat is available
    for (const seatNum of seatsToBook) {
      const seat = trip.seats.find(s => s.number === seatNum);
      console.log(`Checking seat ${seatNum}:`, {
        seatFound: !!seat,
        seatData: seat ? { number: seat.number, isBooked: seat.isBooked, bookedBy: seat.bookedBy } : 'not found',
        seatsArrayHasNumber: trip.seats?.some(s => s.number === seatNum) || false
      });
      
      if (!seat) {
        console.log(`Seat ${seatNum} NOT FOUND in seats array. Available seats: ${trip.availableSeats}, Total seats: ${trip.totalSeats}`);
        unavailableSeats.push({ num: seatNum, label: seatFormatter(seatNum) });
      } else if (seat.isBooked) {
        console.log(`Seat ${seatNum} is ALREADY BOOKED`);
        unavailableSeats.push({ num: seatNum, label: seatFormatter(seatNum) });
      } else {
        console.log(`Seat ${seatNum} is AVAILABLE`);
      }
    }

    if (unavailableSeats.length > 0) {
      if (useTransaction) {
        await session.abortTransaction();
        session.endSession();
      }
      console.log('Unavailable seats detected:', unavailableSeats);
      const seatLabels = unavailableSeats.map(s => s.label).join(', ');
      const seatNumbers = unavailableSeats.map(s => s.num).join(', ');
      return res.status(400).json({
        success: false,
        message: `Seat(s) ${seatLabels} (${seatNumbers}) ${unavailableSeats.length === 1 ? 'is' : 'are'} already booked. Please select different seats.`
      });
    }

    // Check if enough seats are available
    if (trip.availableSeats < seatsToBook.length) {
      if (useTransaction) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({
        success: false,
        message: `Not enough seats available. Only ${trip.availableSeats} seat(s) remaining.`
      });
    }

    // Calculate total amount
    const totalAmount = trip.price * seatsToBook.length;

    // Re-fetch trip one more time to ensure we have the latest state (prevent race condition)
    if (useTransaction) {
      trip = await Trip.findById(tripId).session(session);
    } else {
      trip = await Trip.findById(tripId);
    }

    // Re-initialize seats array after re-fetch (critical for race condition prevention)
    if (!trip.seats || trip.seats.length === 0) {
      trip.seats = [];
      for (let i = 1; i <= trip.totalSeats; i++) {
        trip.seats.push({
          number: i,
          isBooked: false,
          bookedBy: null
        });
      }
      trip.availableSeats = trip.totalSeats;
    } else if (trip.seats.length < trip.totalSeats) {
      // Ensure all seats from 1 to totalSeats exist
      const existingSeatNumbers = new Set(trip.seats.map(s => s.number));
      for (let i = 1; i <= trip.totalSeats; i++) {
        if (!existingSeatNumbers.has(i)) {
          trip.seats.push({
            number: i,
            isBooked: false,
            bookedBy: null
          });
        }
      }
      trip.seats.sort((a, b) => a.number - b.number);
      const bookedCount = trip.seats.filter(s => s.isBooked).length;
      trip.availableSeats = trip.totalSeats - bookedCount;
    } else {
      // Recalculate available seats to ensure accuracy
      const bookedCount = trip.seats.filter(s => s.isBooked).length;
      trip.availableSeats = trip.totalSeats - bookedCount;
      trip.seats.sort((a, b) => a.number - b.number);
    }

    // Double-check seats are still available (in case they were booked between validation and now)
    const finalCheckSeats = [];
    for (const seatNum of seatsToBook) {
      const seat = trip.seats.find(s => s.number === seatNum);
      if (!seat) {
        // Seat doesn't exist - this shouldn't happen if initialization worked
        console.warn(`Seat ${seatNum} not found in trip seats array after re-initialization`);
        finalCheckSeats.push({ num: seatNum, label: seatFormatter(seatNum) });
      } else if (seat.isBooked) {
        finalCheckSeats.push({ num: seatNum, label: seatFormatter(seatNum) });
      }
    }

    if (finalCheckSeats.length > 0) {
      if (useTransaction) {
        await session.abortTransaction();
        session.endSession();
      }
      const seatLabels = finalCheckSeats.map(s => s.label).join(', ');
      const seatNumbers = finalCheckSeats.map(s => s.num).join(', ');
      return res.status(400).json({
        success: false,
        message: `Seat(s) ${seatLabels} (${seatNumbers}) ${finalCheckSeats.length === 1 ? 'was' : 'were'} just booked by another user. Please select different seats.`
      });
    }

    // Mark seats as booked BEFORE creating booking (atomic operation)
    seatsToBook.forEach(seatNum => {
      const seat = trip.seats.find(s => s.number === seatNum);
      if (seat) {
        seat.isBooked = true;
        seat.bookedBy = userId;
      } else {
        // If seat doesn't exist, create it
        trip.seats.push({
          number: seatNum,
          isBooked: true,
          bookedBy: userId
        });
      }
    });

    // Recalculate available seats
    const bookedCount = trip.seats.filter(s => s.isBooked).length;
    trip.availableSeats = trip.totalSeats - bookedCount;
    
    // Sort seats by number
    trip.seats.sort((a, b) => a.number - b.number);
    
    // Save trip first (with or without session)
    if (useTransaction) {
      await trip.save({ session });
    } else {
      await trip.save();
    }

    // Create booking (with or without session)
    const createdBooking = new Booking({
      user: userId,
      trip: tripId,
      seats: seatsToBook,
      totalAmount,
      paymentMethod
    });
    
    if (useTransaction) {
      await createdBooking.save({ session });
    } else {
      await createdBooking.save();
    }

    // Commit transaction if using one
    if (useTransaction) {
      await session.commitTransaction();
      session.endSession();
    }

    // Populate booking with trip details (after transaction)
    await createdBooking.populate('trip user');

    res.status(201).json({
      success: true,
      data: createdBooking,
      message: 'Booking confirmed successfully'
    });
  } catch (error) {
    // Abort transaction on error (if using transaction)
    if (useTransaction && session) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Error aborting transaction:', abortError);
      }
      session.endSession();
    }
    
    console.error('Booking error:', error);
    
    // Handle duplicate key errors (if any unique constraints exist)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Booking conflict. Please try again.'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: messages || 'Validation error'
      });
    }

    // Handle transaction errors
    if (error.errorLabels && error.errorLabels.includes('TransientTransactionError')) {
      return res.status(409).json({
        success: false,
        message: 'Booking conflict detected. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error while processing booking'
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/user
// @access  Private
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('trip')
      .populate('user', 'name email')
      .sort({ bookingDate: -1 });

    const now = new Date();
    const upcoming = bookings.filter(b => {
      const tripDate = new Date(b.trip.date);
      return tripDate >= now && b.status === 'confirmed';
    });
    const past = bookings.filter(b => {
      const tripDate = new Date(b.trip.date);
      return tripDate < now || b.status === 'cancelled';
    });

    res.status(200).json({
      success: true,
      data: {
        upcoming,
        past,
        all: bookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings
// @access  Private/Admin
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('trip', 'source destination date time price')
      .populate('user', 'name email')
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Free up seats
    const tripId = booking.trip._id || booking.trip;
    const trip = await Trip.findById(tripId);
    
    if (trip) {
      booking.seats.forEach(seatNum => {
        const seat = trip.seats.find(s => s.number === seatNum);
        if (seat) {
          seat.isBooked = false;
          seat.bookedBy = null;
        }
      });

      trip.availableSeats = trip.availableSeats + booking.seats.length;
      await trip.save();
    }

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

