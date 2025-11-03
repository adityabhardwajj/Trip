import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  seats: [{
    type: Number,
    required: true
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'cash', 'upi', 'razorpay']
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

bookingSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'trip',
    select: 'source destination date time price'
  }).populate({
    path: 'user',
    select: 'name email'
  });
  next();
});

export default mongoose.model('Booking', bookingSchema);

