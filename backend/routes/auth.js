const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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

function validatePassword(password, label = 'Password') {
  if (typeof password !== 'string' || password.length < 8) {
    return `${label} must be at least 8 characters.`;
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return `${label} must include at least one letter and one number.`;
  }
  return null;
}

function validateCredentials({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { error: 'A valid email address is required.' };
  }
  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };
  return { email: normalizedEmail, password };
}

function createResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  return {
    token,
    tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  };
}

function buildResetUrl(req, token) {
  const configuredBase = cleanString(process.env.PASSWORD_RESET_BASE_URL || process.env.CLIENT_ORIGIN);
  const origin = configuredBase || `${req.protocol}://${req.get('host')}`;
  return `${origin.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
}

async function sendPasswordResetEmail(to, resetUrl) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.PASSWORD_RESET_FROM || 'BudgetBrain <onboarding@resend.dev>',
      to,
      subject: 'Reset your BudgetBrain password',
      html: `
        <p>You requested a BudgetBrain password reset.</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(`Password reset email failed with status ${response.status}`);
  }
  return true;
}

const resetRequestedMessage = 'If an account exists for that email, a password reset link has been sent.';

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
    user.password = await bcrypt.hash(credentials.password, salt);

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
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;
  if (!email || !email.includes('@') || typeof password !== 'string' || password.length === 0) {
    return sendError(res, 400, 'Email and password are required.');
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return sendError(res, 400, 'Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return sendError(res, 400, 'Invalid email or password.');
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

// @route   POST api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!email || !email.includes('@')) {
    return sendError(res, 400, 'A valid email address is required.');
  }

  try {
    const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');
    if (!user) {
      return res.json({ msg: resetRequestedMessage });
    }

    const reset = createResetToken();
    const resetUrl = buildResetUrl(req, reset.token);
    user.resetPasswordToken = reset.tokenHash;
    user.resetPasswordExpires = reset.expiresAt;
    await user.save();

    let emailSent = false;
    try {
      emailSent = await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailErr) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      throw emailErr;
    }

    const body = { msg: resetRequestedMessage };
    if (!emailSent && process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      body.resetUrl = resetUrl;
    }
    res.json(body);
  } catch (err) {
    handleServerError(res, err, 'Password reset is temporarily unavailable.');
  }
});

// @route   POST api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
  const token = cleanString(req.body.token);
  const { password } = req.body;
  if (!token) return sendError(res, 400, 'Password reset token is required.');
  const passwordError = validatePassword(password, 'New password');
  if (passwordError) return sendError(res, 400, passwordError);

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return sendError(res, 400, 'Password reset link is invalid or expired.');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.json({ msg: 'Password reset successfully. You can log in with your new password.' });
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
  const passwordError = validatePassword(newPassword, 'New password');
  if (passwordError) return sendError(res, 400, passwordError);

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
module.exports._internals = {
  createResetToken,
  validatePassword,
};
