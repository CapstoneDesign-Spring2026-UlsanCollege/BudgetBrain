const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const {
  ACCOUNTING_CURRENCY,
  cleanString,
  handleServerError,
  isValidColor,
  isValidObjectId,
  parsePositiveNumber,
  sendError,
} = require('../utils/http');

// @route   GET api/budgets
// @desc    Get all user budgets
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(budgets);
  } catch (err) {
    handleServerError(res, err);
  }
});

// @route   POST api/budgets
// @desc    Add new budget
// @access  Private
router.post('/', auth, async (req, res) => {
  const name = cleanString(req.body.name);
  const parsedAmount = parsePositiveNumber(req.body.amount, 'Budget amount');
  const color = cleanString(req.body.color);

  if (!name) return sendError(res, 400, 'Budget name is required.');
  if (parsedAmount.error) return sendError(res, 400, parsedAmount.error);
  if (!isValidColor(color)) return sendError(res, 400, 'Budget color is invalid.');

  try {
    const newBudget = new Budget({
      name,
      amount: parsedAmount.value,
      currency: ACCOUNTING_CURRENCY,
      color,
      user: req.user.id
    });

    const budget = await newBudget.save();
    res.status(201).json(budget);
  } catch (err) {
    handleServerError(res, err);
  }
});

// @route   PUT api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put('/:id', auth, async (req, res) => {
  if (!isValidObjectId(req.params.id)) return sendError(res, 400, 'Budget id is invalid.');

  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) return sendError(res, 404, 'Budget not found.');

    if (budget.user.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized.');
    }

    if (req.body.name !== undefined) {
      const name = cleanString(req.body.name);
      if (!name) return sendError(res, 400, 'Budget name is required.');
      budget.name = name;
    }
    if (req.body.amount !== undefined) {
      const parsedAmount = parsePositiveNumber(req.body.amount, 'Budget amount');
      if (parsedAmount.error) return sendError(res, 400, parsedAmount.error);
      budget.amount = parsedAmount.value;
    }
    if (req.body.color !== undefined) {
      const color = cleanString(req.body.color);
      if (!isValidColor(color)) return sendError(res, 400, 'Budget color is invalid.');
      budget.color = color;
    }
    budget.currency = ACCOUNTING_CURRENCY;

    await budget.save();
    res.json(budget);
  } catch (err) {
    handleServerError(res, err);
  }
});

// @route   DELETE api/budgets/:id
// @desc    Delete a budget and its expenses
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  if (!isValidObjectId(req.params.id)) return sendError(res, 400, 'Budget id is invalid.');

  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) return sendError(res, 404, 'Budget not found.');

    if (budget.user.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized.');
    }

    await Expense.deleteMany({ budget: req.params.id, user: req.user.id });

    await budget.deleteOne();

    res.json({ msg: 'Budget removed' });
  } catch (err) {
    handleServerError(res, err);
  }
});

module.exports = router;
