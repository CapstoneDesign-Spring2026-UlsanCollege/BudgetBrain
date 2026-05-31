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

function hashSecret(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function createResetCode() {
  const code = String(crypto.randomInt(100000, 1000000));
  return {
    code,
    codeHash: hashSecret(code),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  };
}

function getEmailConfigStatus() {
  return {
    hasResendKey: Boolean(process.env.RESEND_API_KEY),
    hasSender: Boolean(process.env.PASSWORD_RESET_FROM),
  };
}

async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PASSWORD_RESET_FROM;
  if (!apiKey || !from) return false;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email delivery failed with status ${response.status}`);
  }
  return true;
}

async function sendPasswordResetEmail(to, code) {
  return sendEmail({
    to,
    subject: 'Your BudgetBrain password reset code',
    html: `
      <p>You requested a BudgetBrain password reset.</p>
      <p>Your reset code is:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${code}</p>
      <p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
    `,
  });
}

async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to BudgetBrain',
    html: `
      <p>Hi ${user.name},</p>
      <p>Your BudgetBrain account was created successfully.</p>
      <p>If this was not you, reset your password immediately from the login page.</p>
    `,
  });
}

const resetRequestedMessage = 'If an account exists for that email, a password reset code has been sent.';

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
    sendWelcomeEmail(user).catch((emailErr) => {
      console.warn(`Welcome email failed: ${emailErr.message}`);
    });

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
    const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires +resetPasswordAttempts');
    if (!user) {
      return res.json({ msg: resetRequestedMessage });
    }

    const reset = createResetCode();
    user.resetPasswordToken = reset.codeHash;
    user.resetPasswordExpires = reset.expiresAt;
    user.resetPasswordAttempts = 0;
    await user.save();

    let emailSent = false;
    try {
      emailSent = await sendPasswordResetEmail(user.email, reset.code);
    } catch (emailErr) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      user.resetPasswordAttempts = 0;
      await user.save();
      throw emailErr;
    }

    const body = { msg: resetRequestedMessage };
    if (!emailSent && (process.env.NODE_ENV === 'production' || process.env.VERCEL)) {
      const missing = [];
      const emailConfig = getEmailConfigStatus();
      if (!emailConfig.hasResendKey) missing.push('RESEND_API_KEY');
      if (!emailConfig.hasSender) missing.push('PASSWORD_RESET_FROM');
      return sendError(
        res,
        503,
        `Password reset email is not configured. Missing Vercel env: ${missing.join(', ')}.`
      );
    }
    if (!emailSent && process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      body.resetCode = reset.code;
    }
    res.json(body);
  } catch (err) {
    handleServerError(res, err, 'Password reset is temporarily unavailable.');
  }
});

// @route   POST api/auth/reset-password
// @desc    Reset password with email code
// @access  Public
router.post('/reset-password', async (req, res) => {
  const token = cleanString(req.body.token);
  const email = normalizeEmail(req.body.email);
  const code = cleanString(req.body.code).replace(/\s/g, '');
  const { password } = req.body;
  if (!token && (!email || !email.includes('@') || !/^\d{6}$/.test(code))) {
    return sendError(res, 400, 'A valid email and 6-digit reset code are required.');
  }
  const passwordError = validatePassword(password, 'New password');
  if (passwordError) return sendError(res, 400, passwordError);

  try {
    const tokenHash = hashSecret(token || code);
    const lookup = token
      ? {
          resetPasswordToken: tokenHash,
          resetPasswordExpires: { $gt: new Date() },
        }
      : {
          email,
          resetPasswordToken: tokenHash,
          resetPasswordExpires: { $gt: new Date() },
        };

    const userForEmail = token ? null : await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires +resetPasswordAttempts');
    if (userForEmail && userForEmail.resetPasswordAttempts >= 5) {
      userForEmail.resetPasswordToken = null;
      userForEmail.resetPasswordExpires = null;
      userForEmail.resetPasswordAttempts = 0;
      await userForEmail.save();
      return sendError(res, 400, 'Too many reset attempts. Please request a new code.');
    }

    const user = await User.findOne({
      ...lookup,
    }).select('+resetPasswordToken +resetPasswordExpires +resetPasswordAttempts');

    if (!user) {
      if (userForEmail) {
        userForEmail.resetPasswordAttempts = (userForEmail.resetPasswordAttempts || 0) + 1;
        await userForEmail.save();
      }
      return sendError(res, 400, 'Password reset code is invalid or expired.');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.resetPasswordAttempts = 0;
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
  createResetCode,
  getEmailConfigStatus,
  hashSecret,
  validatePassword,
};
