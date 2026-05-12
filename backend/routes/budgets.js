const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @route   GET api/budgets
// @desc    Get all user budgets
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(budgets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/budgets
// @desc    Add new budget
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, amount, color } = req.body;

  try {
    const newBudget = new Budget({
      name,
      amount,
      color,
      user: req.user.id
    });

    const budget = await newBudget.save();
    res.json(budget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, amount, color } = req.body;

  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) return res.status(404).json({ msg: 'Budget not found' });

    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if (name !== undefined) budget.name = name;
    if (amount !== undefined) budget.amount = amount;
    if (color !== undefined) budget.color = color;

    await budget.save();
    res.json(budget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/budgets/:id
// @desc    Delete a budget and its expenses
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) return res.status(404).json({ msg: 'Budget not found' });

    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Delete associated expenses first
    await Expense.deleteMany({ budget: req.params.id });

    // Delete the budget
    await budget.deleteOne();

    res.json({ msg: 'Budget removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
