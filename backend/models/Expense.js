const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  budget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'NPR',
    enum: ['NPR'],
    immutable: true
  },
  category: {
    type: String,
    default: 'other',
    trim: true,
    maxlength: 40
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ExpenseSchema.index({ user: 1, createdAt: -1 });
ExpenseSchema.index({ user: 1, budget: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
