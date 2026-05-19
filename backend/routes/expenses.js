const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const {
  cleanString,
  handleServerError,
  isValidObjectId,
  parsePositiveNumber,
  sendError,
} = require('../utils/http');

// @route   GET api/expenses
// @desc    Get all user expenses
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    handleServerError(res, err);
  }
});

// @route   POST api/expenses
// @desc    Add new expense
// @access  Private
router.post('/', auth, async (req, res) => {
  const name = cleanString(req.body.name);
  const parsedAmount = parsePositiveNumber(req.body.amount, 'Expense amount');
  const budgetId = cleanString(req.body.budgetId);
  const category = cleanString(req.body.category) || 'other';

  if (!name) return sendError(res, 400, 'Expense name is required.');
  if (parsedAmount.error) return sendError(res, 400, parsedAmount.error);
  if (!isValidObjectId(budgetId)) return sendError(res, 400, 'Budget id is invalid.');

  try {
    const budget = await Budget.findOne({ _id: budgetId, user: req.user.id });
    if (!budget) return sendError(res, 404, 'Budget not found.');

    const newExpense = new Expense({
      name,
      amount: parsedAmount.value,
      category,
      budget: budgetId,
      user: req.user.id
    });

    const expense = await newExpense.save();
    res.status(201).json(expense);
  } catch (err) {
    handleServerError(res, err);
  }
});

// @route   PUT api/expenses/:id
// @desc    Update an expense
// @access  Private
router.put('/:id', auth, async (req, res) => {
  if (!isValidObjectId(req.params.id)) return sendError(res, 400, 'Expense id is invalid.');

  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) return sendError(res, 404, 'Expense not found.');

    if (expense.user.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized.');
    }

    if (req.body.name !== undefined) {
      const name = cleanString(req.body.name);
      if (!name) return sendError(res, 400, 'Expense name is required.');
      expense.name = name;
    }
    if (req.body.amount !== undefined) {
      const parsedAmount = parsePositiveNumber(req.body.amount, 'Expense amount');
      if (parsedAmount.error) return sendError(res, 400, parsedAmount.error);
      expense.amount = parsedAmount.value;
    }
    if (req.body.category !== undefined) {
      expense.category = cleanString(req.body.category) || 'other';
    }

    await expense.save();
    res.json(expense);
  } catch (err) {
    handleServerError(res, err);
  }
});

// @route   DELETE api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  if (!isValidObjectId(req.params.id)) return sendError(res, 400, 'Expense id is invalid.');

  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) return sendError(res, 404, 'Expense not found.');

    if (expense.user.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized.');
    }

    await expense.deleteOne();
    res.json({ msg: 'Expense removed' });
  } catch (err) {
    handleServerError(res, err);
  }
});

module.exports = router;
