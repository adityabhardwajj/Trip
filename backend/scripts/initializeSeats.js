import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Trip from '../models/Trip.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms';

async function initializeSeats() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const trips = await Trip.find({});

    console.log(`Found ${trips.length} trips to process`);

    let updatedCount = 0;

    for (const trip of trips) {
      let needsUpdate = false;
      
      if (!trip.seats || trip.seats.length === 0) {
        console.log(`Trip ${trip._id}: Seats array is empty, initializing...`);
        trip.seats = [];
        for (let i = 1; i <= trip.totalSeats; i++) {
          trip.seats.push({
            number: i,
            isBooked: false,
            bookedBy: null
          });
        }
        trip.availableSeats = trip.totalSeats;
        needsUpdate = true;
      } else if (trip.seats.length < trip.totalSeats) {
        const existingSeatNumbers = new Set(trip.seats.map(s => s.number));
        let missingSeats = 0;
        
        for (let i = 1; i <= trip.totalSeats; i++) {
          if (!existingSeatNumbers.has(i)) {
            trip.seats.push({
              number: i,
              isBooked: false,
              bookedBy: null
            });
            missingSeats++;
          }
        }
        
        if (missingSeats > 0) {
          console.log(`Trip ${trip._id}: Added ${missingSeats} missing seats`);
          trip.seats.sort((a, b) => a.number - b.number);
          const bookedCount = trip.seats.filter(s => s.isBooked).length;
          trip.availableSeats = trip.totalSeats - bookedCount;
          needsUpdate = true;
        }
      }

      if (trip.seats && trip.seats.length > 0) {
        const bookedCount = trip.seats.filter(s => s.isBooked).length;
        const calculatedAvailable = trip.totalSeats - bookedCount;
        if (trip.availableSeats !== calculatedAvailable) {
          console.log(`Trip ${trip._id}: Updating availableSeats from ${trip.availableSeats} to ${calculatedAvailable}`);
          trip.availableSeats = calculatedAvailable;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await trip.save();
        updatedCount++;
        console.log(`✓ Updated trip ${trip._id}: ${trip.source} to ${trip.destination} (${trip.seats.length} seats initialized)`);
      } else {
        console.log(`- Trip ${trip._id}: Already has ${trip.seats?.length || 0} seats, no update needed`);
      }
    }

    console.log(`\n✓ Completed! Updated ${updatedCount} out of ${trips.length} trips`);
    
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing seats:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

initializeSeats();

