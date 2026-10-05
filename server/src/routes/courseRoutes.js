import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public read endpoints
router.get('/', getCourses);
router.get('/:id', getCourseById);

// JWT Protected mutations
// POST: Any instructor/admin can create
router.post('/', protect, authorize('instructor', 'admin'), createCourse);

// PUT: Protected + strict data ownership verified in controller
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);

// DELETE: Protected + strict data ownership verified in controller
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

export default router;
