import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { _id: false });

const tripSchema = new mongoose.Schema({
  source: {
    type: String,
    required: [true, 'Please provide source location'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Please provide destination location'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide trip date']
  },
  time: {
    type: String,
    required: [true, 'Please provide trip time']
  },
  price: {
    type: Number,
    required: [true, 'Please provide trip price'],
    min: 0
  },
  totalSeats: {
    type: Number,
    required: [true, 'Please provide total seats'],
    min: 1
  },
  seats: [seatSchema],
  availableSeats: {
    type: Number,
    default: function() {
      return this.totalSeats;
    }
  }
}, {
  timestamps: true
});

// Initialize seats array when creating or updating a trip
tripSchema.pre('save', function(next) {
  // Only process if totalSeats is defined
  if (!this.totalSeats || this.totalSeats < 1) {
    return next();
  }

  // Initialize seats if missing or empty
  if (!this.seats || this.seats.length === 0) {
    this.seats = [];
    for (let i = 1; i <= this.totalSeats; i++) {
      this.seats.push({
        number: i,
        isBooked: false,
        bookedBy: null
      });
    }
  } else {
    // Ensure all seats from 1 to totalSeats exist
    const existingSeatNumbers = new Set(this.seats.map(s => s.number));
    for (let i = 1; i <= this.totalSeats; i++) {
      if (!existingSeatNumbers.has(i)) {
        this.seats.push({
          number: i,
          isBooked: false,
          bookedBy: null
        });
      }
    }
    // Sort seats by number
    this.seats.sort((a, b) => a.number - b.number);
  }
  
  // Recalculate available seats based on booked seats
  const bookedCount = this.seats.filter(s => s.isBooked).length;
  this.availableSeats = this.totalSeats - bookedCount;
  
  next();
});

// Note: Seat initialization is now handled in controllers to avoid async issues in post hooks

export default mongoose.model('Trip', tripSchema);

