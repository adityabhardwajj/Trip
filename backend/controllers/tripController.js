import Trip from '../models/Trip.js';

export const getTrips = async (req, res) => {
  try {
    const { source, destination, date } = req.query;
    
    let query = {};
    
    if (source) { 
      query.source = new RegExp(source, 'i');
    }
    
    if (destination) {
      query.destination = new RegExp(destination, 'i');
    }
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    let trips = await Trip.find(query).sort({ date: 1, time: 1 });

    for (const trip of trips) {
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
        await trip.save();
      } else if (trip.seats.length < trip.totalSeats) {
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
        await trip.save();
      } else {
        const bookedCount = trip.seats.filter(s => s.isBooked).length;
        trip.availableSeats = trip.totalSeats - bookedCount;
        if (trip.isModified()) {
          await trip.save();
        }
      }
    }

    res.removeHeader('ETag');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Last-Modified', new Date().toUTCString());

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

export const getTrip = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    let needsSave = false;
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
      needsSave = true;
    } else if (trip.seats.length < trip.totalSeats) {
      const existingSeatNumbers = new Set(trip.seats.map(s => s.number));
      for (let i = 1; i <= trip.totalSeats; i++) {
        if (!existingSeatNumbers.has(i)) {
          trip.seats.push({
            number: i,
            isBooked: false,
            bookedBy: null
          });
          needsSave = true;
        }
      }
      trip.seats.sort((a, b) => a.number - b.number);
      const bookedCount = trip.seats.filter(s => s.isBooked).length;
      trip.availableSeats = trip.totalSeats - bookedCount;
    } else {
      const bookedCount = trip.seats.filter(s => s.isBooked).length;
      const calculatedAvailable = trip.totalSeats - bookedCount;
      if (trip.availableSeats !== calculatedAvailable) {
        trip.availableSeats = calculatedAvailable;
        needsSave = true;
      }
    }

    if (needsSave) {
      await trip.save();
      trip = await Trip.findById(req.params.id);
    }

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
    }

    res.removeHeader('ETag');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Last-Modified', new Date().toUTCString());

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

export const createTrip = async (req, res) => {
  try {
    const { source, destination, date, time, price, totalSeats } = req.body;

    const trip = await Trip.create({
      source,
      destination,
      date,
      time,
      price,
      totalSeats
    });

    res.status(201).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

export const updateTrip = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    await trip.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
