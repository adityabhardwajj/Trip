# Login Credentials

## Default Login Credentials

After running the seed script (`npm run seed`), the following accounts will be available:

### Admin Account
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** Admin (can manage trips, view all bookings)

### Regular User Account
- **Email:** `user@example.com`
- **Password:** `user123`
- **Role:** User (can book trips, view own bookings)

## Setup Instructions

1. **Start MongoDB:**
   ```bash
   # Make sure MongoDB is running
   mongod
   # Or if using MongoDB service:
   brew services start mongodb-community
   ```

2. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Seed the Database:**
   ```bash
   npm run seed
   ```
   This will:
   - Create admin and user accounts
   - Create sample trips
   - Create a sample booking

4. **Start the Backend Server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

5. **Test the APIs:**
   ```bash
   npm test
   ```
   This will run comprehensive API tests to verify all endpoints are working.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Trips
- `GET /api/trips` - Get all trips (with optional filters: source, destination, date)
- `GET /api/trips/:id` - Get single trip
- `POST /api/trips` - Create trip (Admin only)
- `PUT /api/trips/:id` - Update trip (Admin only)
- `DELETE /api/trips/:id` - Delete trip (Admin only)

### Bookings
- `POST /api/bookings` - Create booking (User)
- `GET /api/bookings/user` - Get user's bookings (User)
- `GET /api/bookings/all` - Get all bookings (Admin)
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id/cancel` - Cancel booking (User)

### Users
- `GET /api/users/profile` - Get user profile (Protected)

### Health Check
- `GET /api/health` - Server health check

## Testing with cURL

### Login as Admin
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Login as User
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'
```

### Get Trips (No auth required)
```bash
curl http://localhost:5001/api/trips
```

### Get User Profile (Requires token)
```bash
curl http://localhost:5001/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Notes

- All protected routes require a JWT token in the Authorization header
- Token format: `Authorization: Bearer <token>`
- Tokens expire after 7 days (configurable via JWT_EXPIRE in .env)
- Admin users can access admin-only routes (trip management, all bookings)
- Regular users can only manage their own bookings and profile

