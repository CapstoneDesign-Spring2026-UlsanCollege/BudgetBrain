const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 80
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 254
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: '\uD83C\uDFAF',
    maxlength: 16
  },
  resetPasswordToken: {
    type: String,
    default: null,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ resetPasswordToken: 1, resetPasswordExpires: 1 });

module.exports = mongoose.model('User', UserSchema);
