import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Trip from './models/Trip.js';
import Booking from './models/Booking.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms';

const sampleTrips = [
  {
    source: 'New York',
    destination: 'Boston',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    time: '08:00',
    price: 45.00,
    totalSeats: 40
  },
  {
    source: 'Boston',
    destination: 'New York',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    time: '10:30',
    price: 45.00,
    totalSeats: 40
  },
  {
    source: 'Chicago',
    destination: 'Los Angeles',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    time: '06:00',
    price: 120.00,
    totalSeats: 50
  },
  {
    source: 'Atlanta',
    destination: 'Miami',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    time: '09:15',
    price: 75.00,
    totalSeats: 45
  },
  {
    source: 'New York',
    destination: 'Boston',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    time: '14:00',
    price: 45.00,
    totalSeats: 40
  },
  {
    source: 'Boston',
    destination: 'New York',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    time: '16:30',
    price: 45.00,
    totalSeats: 40
  },
  {
    source: 'Chicago',
    destination: 'Los Angeles',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    time: '08:00',
    price: 120.00,
    totalSeats: 50
  },
  {
    source: 'Atlanta',
    destination: 'Miami',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    time: '11:45',
    price: 75.00,
    totalSeats: 45
  }
];

const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
};

const regularUser = {
  name: 'Aditya Bhardwaj',
  email: 'user@example.com',
  password: 'user123',
  role: 'user'
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Trip.deleteMany({});
    await Booking.deleteMany({});
    console.log('Existing data cleared');

    console.log('Creating admin user...');
    const admin = await User.create(adminUser);
    console.log(`Admin user created: ${admin.email}`);

    console.log('Creating regular user...');
    const user = await User.create(regularUser);
    console.log(`Regular user created: ${user.email}`);

    console.log('Creating sample trips...');
    const createdTrips = await Trip.insertMany(sampleTrips);
    console.log(`Created ${createdTrips.length} trips`);

    if (createdTrips.length > 0 && user) {
      console.log('Creating sample bookings...');
      
      const firstTrip = createdTrips[0];
      const seatsToBook = [1, 2];
      
      seatsToBook.forEach(seatNum => {
        const seat = firstTrip.seats.find(s => s.number === seatNum);
        if (seat) {
          seat.isBooked = true;
          seat.bookedBy = user._id;
        }
      });
      
      firstTrip.availableSeats = firstTrip.availableSeats - seatsToBook.length;
      await firstTrip.save();

      const booking = await Booking.create({
        user: user._id,
        trip: firstTrip._id,
        seats: seatsToBook,
        totalAmount: firstTrip.price * seatsToBook.length,
        paymentMethod: 'card',
        status: 'confirmed'
      });
      
      console.log(`Created booking: ${booking._id}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User:  user@example.com / user123');
    console.log(`\n🚌 Created ${createdTrips.length} trips`);
    console.log('   - New York ↔ Boston');
    console.log('   - Chicago → Los Angeles');
    console.log('   - Atlanta → Miami');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

