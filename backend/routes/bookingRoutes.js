import express from 'express';
import { 
  createBooking, 
  getBookings, 
  getBooking, 
  cancelBooking,
  getUserBookings
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/user', protect, getUserBookings);
// Admin route must come before /:id to avoid route conflicts
router.get('/all', protect, authorize('admin'), getBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);

export default router;

