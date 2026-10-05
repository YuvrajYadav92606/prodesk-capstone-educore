import Course from '../models/Course.js';
import { enrichCourseMetadata } from '../services/aiService.js';
import { logger } from '../config/logger.js';

/**
 * @desc    Get all courses (with optional category, level, or instructor filter)
 * @route   GET /api/courses
 * @access  Public
 */
export const getCourses = async (req, res) => {
  try {
    const query = {};
    if (req.query.instructor) {
      query.instructor = req.query.instructor;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.level) {
      query.level = req.query.level;
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    logger.error('Failed to retrieve courses: %o', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      'instructor',
      'name email role'
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    logger.error('Failed to retrieve course: %o', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new course (with automated server-side data enrichment)
 * @route   POST /api/courses
 * @access  Private (JWT Protected - Instructors & Admins)
 */
export const createCourse = async (req, res) => {
  try {
    const { title, description, category, price, level, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and description',
      });
    }

    logger.info(`Processing course creation for: "${title}" by instructor: ${req.user._id}`);

    // Phase 2: Automated Data Enrichment via Server-Side Pipeline
    const enrichedData = await enrichCourseMetadata({
      title,
      description,
      category: category || 'Web Development',
      level: level || 'intermediate',
    });

    const course = await Course.create({
      title,
      description,
      summary: enrichedData.summary,
      tags: enrichedData.tags,
      learningOutcomes: enrichedData.learningOutcomes,
      estimatedHours: enrichedData.estimatedHours,
      category: category || 'Web Development',
      price: price !== undefined ? Number(price) : 49.99,
      level: level || 'intermediate',
      status: status || 'published',
      instructor: req.user._id,
    });

    const populatedCourse = await Course.findById(course._id).populate(
      'instructor',
      'name email role'
    );

    logger.info(`Course created and enriched with ID: ${course._id}`);

    res.status(201).json({
      success: true,
      data: populatedCourse,
    });
  } catch (error) {
    logger.error('Failed to create course: %o', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message,
    });
  }
};

/**
 * @desc    Update course with strict Data Ownership verification
 * @route   PUT /api/courses/:id
 * @access  Private (JWT Protected - Owner Only)
 */
export const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // CRITICAL DATA OWNERSHIP CHECK:
    const isOwner = course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      logger.warn(`Unauthorized course update attempt on ${req.params.id} by user: ${req.user._id}`);
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this course. Modification rejected by security policy.',
      });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('instructor', 'name email role');

    logger.info(`Course updated with ID: ${course._id}`);

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    logger.error('Failed to update course: %o', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete course with strict Data Ownership verification
 * @route   DELETE /api/courses/:id
 * @access  Private (JWT Protected - Owner Only)
 */
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // CRITICAL DATA OWNERSHIP CHECK:
    const isOwner = course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      logger.warn(`Unauthorized course delete attempt on ${req.params.id} by user: ${req.user._id}`);
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this course. Deletion rejected by security policy.',
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    logger.info(`Course deleted with ID: ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: 'Course successfully deleted',
      deletedId: req.params.id,
    });
  } catch (error) {
    logger.error('Failed to delete course: %o', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message,
    });
  }
};
