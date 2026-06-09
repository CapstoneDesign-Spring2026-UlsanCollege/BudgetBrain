const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
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
  color: {
    type: String,
    required: true,
    trim: true,
    maxlength: 32
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

BudgetSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Budget', BudgetSchema);
