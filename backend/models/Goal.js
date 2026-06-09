const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  savedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'NPR',
    enum: ['NPR'],
    immutable: true
  },
  deadline: {
    type: Date,
  },
  icon: {
    type: String,
    default: '\uD83C\uDFAF',
    maxlength: 16
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

GoalSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Goal', GoalSchema);
