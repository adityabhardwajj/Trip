import express from 'express';
import { 
  getTrips, 
  getTrip, 
  createTrip, 
  updateTrip, 
  deleteTrip 
} from '../controllers/tripController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getTrips);
router.get('/:id', getTrip);
router.post('/', protect, authorize('admin'), createTrip);
router.put('/:id', protect, authorize('admin'), updateTrip);
router.delete('/:id', protect, authorize('admin'), deleteTrip);

export default router;

