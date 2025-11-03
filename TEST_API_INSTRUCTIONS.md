# Quick Start: Test APIs

## Step 1: Seed the Database

Run the seed script to create login credentials and sample data:

```bash
cd backend
npm run seed
```

**This creates:**
- Admin user: `admin@example.com` / `admin123`
- Regular user: `user@example.com` / `user123`
- Sample trips (8 trips)
- Sample booking

## Step 2: Start the Backend Server

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:5001`

## Step 3: Test the APIs

### Option A: Run Automated Tests

```bash
cd backend
npm test
```

This will run comprehensive tests for all API endpoints.

### Option B: Manual Testing

#### 1. Health Check
```bash
curl http://localhost:5001/api/health
```

#### 2. Login as Admin
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Copy the token from the response.

#### 3. Login as User
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'
```

#### 4. Get All Trips
```bash
curl http://localhost:5001/api/trips
```

#### 5. Get User Profile (Replace YOUR_TOKEN)
```bash
curl http://localhost:5001/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 6. Get User Bookings (Replace YOUR_TOKEN)
```bash
curl http://localhost:5001/api/bookings/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Testing

1. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Login Credentials:**
   - Admin: `admin@example.com` / `admin123`
   - User: `user@example.com` / `user123`

3. **Test Features:**
   - Login/Register
   - Browse trips on home page
   - Book a trip (select seats, checkout, payment)
   - View bookings in "My Bookings"
   - Admin: Manage trips in Admin Panel

## Troubleshooting

### MongoDB Not Running
```bash
# Start MongoDB
brew services start mongodb-community
# OR
mongod
```

### Port Already in Use
- Check if something is using port 5001
- Change PORT in `.env` file if needed

### API Tests Failing
- Make sure MongoDB is running
- Make sure backend server is running (`npm run dev`)
- Run seed script first (`npm run seed`)

