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
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
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

// Indexes for fast querying
CourseSchema.index({ instructor: 1, createdAt: -1 });

const Course = mongoose.model('Course', CourseSchema);

export default Course;
