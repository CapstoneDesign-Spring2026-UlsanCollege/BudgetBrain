const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Goal = require('../models/Goal');
const {
  cleanString,
  handleServerError,
  isValidObjectId,
  parseNonNegativeNumber,
  parseOptionalDate,
  parsePositiveNumber,
  sendError,
} = require('../utils/http');

router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    handleServerError(res, err);
  }
});

router.post('/', auth, async (req, res) => {
  const name = cleanString(req.body.name);
  const parsedTarget = parsePositiveNumber(req.body.targetAmount, 'Target amount');
  const parsedDeadline = parseOptionalDate(req.body.deadline, 'Deadline');
  const icon = cleanString(req.body.icon) || '\uD83C\uDFAF';

  if (!name) return sendError(res, 400, 'Goal name is required.');
  if (parsedTarget.error) return sendError(res, 400, parsedTarget.error);
  if (parsedDeadline.error) return sendError(res, 400, parsedDeadline.error);

  try {
    const goal = new Goal({
      name,
      targetAmount: parsedTarget.value,
      deadline: parsedDeadline.value,
      icon,
      user: req.user.id
    });
    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    handleServerError(res, err);
  }
});

router.patch('/:id/savings', auth, async (req, res) => {
  if (!isValidObjectId(req.params.id)) return sendError(res, 400, 'Goal id is invalid.');

  const parsedAmount = parsePositiveNumber(req.body.amount, 'Savings amount');
  if (parsedAmount.error) return sendError(res, 400, parsedAmount.error);

  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return sendError(res, 404, 'Goal not found.');
    if (goal.user.toString() !== req.user.id) return sendError(res, 403, 'Not authorized.');

    goal.savedAmount = Number(goal.savedAmount || 0) + parsedAmount.value;
    await goal.save();
    res.json(goal);
  } catch (err) {
    handleServerError(res, err);
  }
});

router.put('/:id', auth, async (req, res) => {
  if (!isValidObjectId(req.params.id)) return sendError(res, 400, 'Goal id is invalid.');

  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return sendError(res, 404, 'Goal not found.');
    if (goal.user.toString() !== req.user.id) return sendError(res, 403, 'Not authorized.');

    if (req.body.name !== undefined) {
      const name = cleanString(req.body.name);
      if (!name) return sendError(res, 400, 'Goal name is required.');
      goal.name = name;
    }
    if (req.body.targetAmount !== undefined) {
      const parsedTarget = parsePositiveNumber(req.body.targetAmount, 'Target amount');
      if (parsedTarget.error) return sendError(res, 400, parsedTarget.error);
      goal.targetAmount = parsedTarget.value;
    }
    if (req.body.savedAmount !== undefined) {
      const parsedSaved = parseNonNegativeNumber(req.body.savedAmount, 'Saved amount');
      if (parsedSaved.error) return sendError(res, 400, parsedSaved.error);
      goal.savedAmount = parsedSaved.value;
    }
    if (req.body.deadline !== undefined) {
      const parsedDeadline = parseOptionalDate(req.body.deadline, 'Deadline');
      if (parsedDeadline.error) return sendError(res, 400, parsedDeadline.error);
      goal.deadline = parsedDeadline.value;
    }
    if (req.body.icon !== undefined) {
      const icon = cleanString(req.body.icon);
      if (!icon) return sendError(res, 400, 'Goal icon is required.');
      goal.icon = icon;
    }

    await goal.save();
    res.json(goal);
  } catch (err) {
    handleServerError(res, err);
  }
});

router.delete('/:id', auth, async (req, res) => {
  if (!isValidObjectId(req.params.id)) return sendError(res, 400, 'Goal id is invalid.');

  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return sendError(res, 404, 'Goal not found.');
    if (goal.user.toString() !== req.user.id) return sendError(res, 403, 'Not authorized.');
    await goal.deleteOne();
    res.json({ msg: 'Goal removed' });
  } catch (err) {
    handleServerError(res, err);
  }
});

module.exports = router;
