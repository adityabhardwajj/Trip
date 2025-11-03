import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 5001}/api`;
let adminToken = '';
let userToken = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  test: (msg) => console.log(`\n${colors.yellow}🧪${colors.reset} ${msg}`),
};

async function testAPI(name, fn) {
  try {
    log.test(`Testing: ${name}`);
    await fn();
    log.success(`${name} - PASSED`);
    return true;
  } catch (error) {
    log.error(`${name} - FAILED`);
    console.error('Error:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('\n🚀 Starting API Tests...\n');
  console.log(`API Base URL: ${API_URL}\n`);

  const results = [];

  // Test 1: Health Check
  results.push(await testAPI('Health Check', async () => {
    const response = await axios.get(`${API_URL}/health`);
    if (response.data.status !== 'OK') throw new Error('Health check failed');
  }));

  // Test 2: Register User
  results.push(await testAPI('Register User', async () => {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123456',
    });
    if (!response.data.success || !response.data.data.token) {
      throw new Error('Registration failed');
    }
    userToken = response.data.data.token;
  }));

  // Test 3: Login Admin
  results.push(await testAPI('Login Admin', async () => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123',
    });
    if (!response.data.success || !response.data.data.token) {
      throw new Error('Admin login failed');
    }
    adminToken = response.data.data.token;
  }));

  // Test 4: Login User
  results.push(await testAPI('Login User', async () => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'user@example.com',
      password: 'user123',
    });
    if (!response.data.success || !response.data.data.token) {
      throw new Error('User login failed');
    }
    userToken = response.data.data.token;
  }));

  // Test 5: Get Current User (Protected Route)
  results.push(await testAPI('Get Current User (Protected)', async () => {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (!response.data.success || !response.data.data.email) {
      throw new Error('Get user failed');
    }
  }));

  // Test 6: Get All Trips
  results.push(await testAPI('Get All Trips', async () => {
    const response = await axios.get(`${API_URL}/trips`);
    if (!response.data.success || !Array.isArray(response.data.data)) {
      throw new Error('Get trips failed');
    }
    log.info(`Found ${response.data.data.length} trips`);
  }));

  // Test 7: Get Single Trip
  let tripId = '';
  results.push(await testAPI('Get Single Trip', async () => {
    const tripsResponse = await axios.get(`${API_URL}/trips`);
    if (tripsResponse.data.data.length > 0) {
      tripId = tripsResponse.data.data[0]._id;
      const response = await axios.get(`${API_URL}/trips/${tripId}`);
      if (!response.data.success || !response.data.data._id) {
        throw new Error('Get single trip failed');
      }
    } else {
      throw new Error('No trips available for testing');
    }
  }));

  // Test 8: Create Trip (Admin Only)
  let createdTripId = '';
  results.push(await testAPI('Create Trip (Admin)', async () => {
    const response = await axios.post(
      `${API_URL}/trips`,
      {
        source: 'Test City',
        destination: 'Test Destination',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        time: '12:00',
        price: 50.00,
        totalSeats: 40,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    if (!response.data.success || !response.data.data._id) {
      throw new Error('Create trip failed');
    }
    createdTripId = response.data.data._id;
    log.info(`Created trip with ID: ${createdTripId}`);
  }));

  // Test 9: Update Trip (Admin Only)
  results.push(await testAPI('Update Trip (Admin)', async () => {
    if (!createdTripId) throw new Error('No trip to update');
    const response = await axios.put(
      `${API_URL}/trips/${createdTripId}`,
      {
        price: 55.00,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    if (!response.data.success || response.data.data.price !== 55.00) {
      throw new Error('Update trip failed');
    }
  }));

  // Test 10: Create Booking (User)
  let bookingId = '';
  results.push(await testAPI('Create Booking (User)', async () => {
    if (!tripId) {
      const tripsResponse = await axios.get(`${API_URL}/trips`);
      if (tripsResponse.data.data.length > 0) {
        tripId = tripsResponse.data.data[0]._id;
      } else {
        throw new Error('No trips available for booking');
      }
    }
    const response = await axios.post(
      `${API_URL}/bookings`,
      {
        tripId: tripId,
        seats: [3, 4],
        paymentMethod: 'card',
      },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );
    if (!response.data.success || !response.data.data._id) {
      throw new Error('Create booking failed');
    }
    bookingId = response.data.data._id;
    log.info(`Created booking with ID: ${bookingId}`);
  }));

  // Test 11: Get User Bookings
  results.push(await testAPI('Get User Bookings', async () => {
    const response = await axios.get(`${API_URL}/bookings/user`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (!response.data.success || !response.data.data.upcoming) {
      throw new Error('Get user bookings failed');
    }
    log.info(`Found ${response.data.data.upcoming.length} upcoming bookings`);
  }));

  // Test 12: Get User Profile
  results.push(await testAPI('Get User Profile', async () => {
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (!response.data.success || !response.data.data.email) {
      throw new Error('Get profile failed');
    }
  }));

  // Test 13: Cancel Booking
  results.push(await testAPI('Cancel Booking', async () => {
    if (!bookingId) throw new Error('No booking to cancel');
    const response = await axios.put(
      `${API_URL}/bookings/${bookingId}/cancel`,
      {},
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );
    if (!response.data.success || response.data.data.status !== 'cancelled') {
      throw new Error('Cancel booking failed');
    }
  }));

  // Test 14: Delete Trip (Admin)
  results.push(await testAPI('Delete Trip (Admin)', async () => {
    if (!createdTripId) throw new Error('No trip to delete');
    const response = await axios.delete(`${API_URL}/trips/${createdTripId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!response.data.success) {
      throw new Error('Delete trip failed');
    }
  }));

  // Test 15: Get All Bookings (Admin)
  results.push(await testAPI('Get All Bookings (Admin)', async () => {
    const response = await axios.get(`${API_URL}/bookings/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!response.data.success || !Array.isArray(response.data.data)) {
      throw new Error('Get all bookings failed');
    }
    log.info(`Found ${response.data.data.length} total bookings`);
  }));

  // Summary
  const passed = results.filter((r) => r).length;
  const total = results.length;
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Results: ${passed}/${total} passed`);
  if (passed === total) {
    log.success('All tests passed! ✅');
  } else {
    log.error(`${total - passed} test(s) failed ❌`);
  }
  console.log('\n' + '='.repeat(50));

  console.log('\n📝 Login Credentials:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   User:  user@example.com / user123');
  console.log('\n');

  process.exit(passed === total ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

