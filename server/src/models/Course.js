import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    summary: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: ['Cloud Architecture', 'Web Development', 'Cybersecurity', 'DevOps & SRE', 'Data & AI'],
      default: 'Web Development',
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    price: {
      type: Number,
      required: [true, 'Please specify a course price in USD'],
      min: [0, 'Price cannot be negative'],
      default: 49.99,
    },
    tags: {
      type: [String],
      default: [],
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    estimatedHours: {
      type: Number,
      default: 10,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance searching and filtering
CourseSchema.index({ instructor: 1, createdAt: -1 });
CourseSchema.index({ category: 1, level: 1 });
CourseSchema.index({ tags: 1 });

const Course = mongoose.model('Course', CourseSchema);

export default Course;
