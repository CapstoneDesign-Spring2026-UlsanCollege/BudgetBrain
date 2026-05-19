const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const {
  cleanString,
  handleServerError,
  normalizeEmail,
  sendError,
} = require('../utils/http');

function signToken(payload) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, avatar: user.avatar, createdAt: user.createdAt };
}

function validateCredentials({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { error: 'A valid email address is required.' };
  }
  if (typeof password !== 'string' || password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }
  return { email: normalizedEmail, password };
}

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const name = cleanString(req.body.name);
  const credentials = validateCredentials(req.body);
  if (!name) return sendError(res, 400, 'Name is required.');
  if (credentials.error) return sendError(res, 400, credentials.error);

  try {
    let user = await User.findOne({ email: credentials.email });

    if (user) {
      return sendError(res, 400, 'User already exists.');
    }

    user = new User({
      name,
      email: credentials.email,
      password: credentials.password
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    const token = signToken(payload);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    handleServerError(res, err);
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const credentials = validateCredentials(req.body);
  if (credentials.error) return sendError(res, 400, credentials.error);

  try {
    let user = await User.findOne({ email: credentials.email });

    if (!user) {
      return sendError(res, 400, 'No account found with this email address.');
    }

    const isMatch = await bcrypt.compare(credentials.password, user.password);

    if (!isMatch) {
      return sendError(res, 400, 'Incorrect password. Please try again.');
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    const token = signToken(payload);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    handleServerError(res, err);
  }
});

// @route   GET api/auth/me
// @desc    Get user data
// @access  Private (Needs token)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return sendError(res, 404, 'User not found.');
    res.json(user);
  } catch (err) {
    handleServerError(res, err);
  }
});

// @route   PUT api/auth/me
// @desc    Update user name
// @access  Private
router.put('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'User not found.');

    if (req.body.name !== undefined) {
      const nextName = cleanString(req.body.name);
      if (!nextName) return sendError(res, 400, 'Name is required.');
      user.name = nextName;
    }
    if (req.body.avatar !== undefined) {
      const nextAvatar = cleanString(req.body.avatar);
      if (!nextAvatar) return sendError(res, 400, 'Avatar is required.');
      user.avatar = nextAvatar;
    }

    await user.save();
    res.json(publicUser(user));
  } catch (err) {
    handleServerError(res, err);
  }
});

// @route   PUT api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
    return sendError(res, 400, 'Current password is required.');
  }
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return sendError(res, 400, 'New password must be at least 6 characters.');
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'User not found.');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return sendError(res, 400, 'Current password is incorrect.');

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ msg: 'Password changed successfully' });
  } catch (err) {
    handleServerError(res, err);
  }
});

module.exports = router;
