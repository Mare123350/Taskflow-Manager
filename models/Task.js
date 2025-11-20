const mongoose = require('mongoose');

/**
 * Task Schema Definition
 * Defines the structure and validation rules for task documents
 */
const taskSchema = new mongoose.Schema({
  // Task title - required field
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  // Task description - optional field
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Priority level - required with specific values
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: 'Priority must be Low, Medium, or High'
    },
    default: 'Medium'
  },
  
  // Task category - required with specific values
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Work', 'Personal', 'School', 'Other'],
      message: 'Category must be Work, Personal, School, or Other'
    },
    default: 'Other'
  },
  
  // Due date - optional
  dueDate: {
    type: Date,
    default: null
  },
  
  // Completion status - boolean with default false
  completed: {
    type: Boolean,
    default: false
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

/**
 * Virtual property to format due date for display
 * This won't be stored in the database but can be accessed on task objects
 */
taskSchema.virtual('formattedDueDate').get(function() {
  if (!this.dueDate) return 'No due date';
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return this.dueDate.toLocaleDateString('en-US', options);
});

/**
 * Instance method to check if task is overdue
 * Returns true if task has a due date that has passed and task is not completed
 */
taskSchema.methods.isOverdue = function() {
  if (!this.dueDate || this.completed) return false;
  return this.dueDate < new Date();
};

// Create and export the Task model
module.exports = mongoose.model('Task', taskSchema);