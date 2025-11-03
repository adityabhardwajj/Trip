# HRMS Journey Booking Platform

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for booking journey trips. This project was created as part of the PSQUARE COMPANY hiring process.

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (User/Admin)
- Protected routes
- User registration and login

### Home Page
- Trip search and filtering (From, To, Date)
- Display available trips
- Book Now functionality

### Trip Details Page
- View trip information (source, destination, date, time, price)
- Interactive seat selection UI
- Real-time seat availability
- Proceed to checkout

### Checkout and Payment
- Booking summary
- Multiple payment methods (Card, UPI, Cash)
- Booking confirmation
- Ticket view/download

### My Bookings Page
- View upcoming bookings
- View past bookings
- Cancel booking option
- View/Print ticket

### Profile Page
- View user information
- Account creation date

### Admin Panel
- Add new trips
- Manage existing trips (Edit/Delete)
- View all trips

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs

### Frontend
- React
- React Router
- Axios
- React Toastify
- Vite
- Vanilla CSS (for one section)

## Project Structure

```
.
├── backend/
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth middleware
│   ├── models/          # Mongoose models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   ├── server.js       # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/    # React Context
│   │   ├── pages/      # Page components
│   │   ├── utils/      # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your_super_secret_jwt_key_here
```

4. Start the backend server:
```bash
npm start
```

The backend server will run on `http://localhost:5000`

5. (Optional) Seed the database with sample data:
```bash
npm run seed
```

This will create:
- An admin user: `admin@example.com` / `admin123`
- A regular user: `user@example.com` / `user123`
- Sample trips (New York ↔ Boston, Chicago → Los Angeles, Atlanta → Miami)
- A sample booking

**Note**: The seed script will clear all existing data before seeding.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Trips
- `GET /api/trips` - Get all trips (with optional filters)
- `GET /api/trips/:id` - Get single trip
- `POST /api/trips` - Create trip (Admin only)
- `PUT /api/trips/:id` - Update trip (Admin only)
- `DELETE /api/trips/:id` - Delete trip (Admin only)

### Bookings
- `POST /api/bookings` - Create booking (Protected)
- `GET /api/bookings/user` - Get user bookings (Protected)
- `GET /api/bookings/all` - Get all bookings (Admin only)
- `GET /api/bookings/:id` - Get single booking (Protected)
- `PUT /api/bookings/:id/cancel` - Cancel booking (Protected)

### Users
- `GET /api/users/profile` - Get user profile (Protected)

## Usage

### Seeding the Database

To quickly populate the database with sample data, run:
```bash
cd backend
npm run seed
```

This creates:
- **Admin User**: `admin@example.com` / `admin123`
- **Regular User**: `user@example.com` / `user123`
- **Sample Trips**: 8 trips with various routes and dates
- **Sample Booking**: One booking for testing

### Creating an Admin User

If you prefer to create an admin user manually:

1. Register a new user through the UI
2. Manually update the user's role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or use MongoDB Compass/Atlas to update the role field directly.

### Booking Flow

1. **Search Trips**: Use the search filters on the home page
2. **Select Trip**: Click "Book Now" on a trip card
3. **Choose Seats**: Select available seats on the trip details page
4. **Checkout**: Review booking summary and select payment method
5. **Confirm**: Complete the booking
6. **View Booking**: Check "My Bookings" page

### Admin Functions

1. **Add Trip**: Navigate to Admin Panel → Add New Trip
2. **Manage Trips**: Navigate to Admin Panel → Manage Trips
3. **Edit Trip**: Click "Edit" on any trip in the manage section
4. **Delete Trip**: Click "Delete" on any trip (confirmation required)

## Error Handling

- API errors are caught and displayed via toast notifications
- 401 errors automatically redirect to login page
- Form validation on client and server side
- Try-catch blocks for all async operations

## Responsive Design

The application is fully responsive and works on:
- Desktop (1440px+)
- Tablet (768px - 1440px)
- Mobile (320px - 768px)

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- Role-based authorization
- Input validation and sanitization

## State Management

- React Context API for authentication state
- Local component state for UI interactions
- Server state management via API calls

## Code Quality

- Modular component structure
- Reusable utility functions
- Consistent error handling
- Clean code organization
- Proper file structure

## Development Notes

- The project uses vanilla CSS for at least one section as per requirements
- All API calls use axios with interceptors for token management
- Toast notifications provide user feedback
- Protected routes ensure proper access control

## License

This project is created for the PSQUARE COMPANY hiring process.

