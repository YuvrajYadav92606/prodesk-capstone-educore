import express from 'express';
import { generateCurriculumBlueprint } from '../services/aiService.js';
import { protect, authorize } from '../middleware/auth.js';
import { logger } from '../config/logger.js';

const router = express.Router();

/**
 * @desc    Generate structured curriculum syllabus via server-side AI pipeline
 * @route   POST /api/ai/generate-curriculum
 * @access  Private (Instructors & Admins)
 */
router.post('/generate-curriculum', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const { topic, category, targetAudience } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid topic to generate a curriculum syllabus.',
      });
    }

    logger.info(`AI Curriculum generation triggered for topic: "${topic}" by user: ${req.user._id}`);

    const blueprint = await generateCurriculumBlueprint(
      topic,
      category || 'Web Development',
      targetAudience || 'Professionals'
    );

    res.status(200).json({
      success: true,
      data: blueprint,
    });
  } catch (error) {
    logger.error('Error generating AI curriculum:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI curriculum generation request',
      error: error.message,
    });
  }
});

export default router;
