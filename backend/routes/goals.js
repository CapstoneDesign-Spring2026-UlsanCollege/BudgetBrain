const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Goal = require('../models/Goal');

router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { name, targetAmount, deadline, icon } = req.body;
  try {
    const goal = new Goal({
      name,
      targetAmount,
      deadline: deadline || null,
      icon: icon || '🎯',
      user: req.user.id
    });
    await goal.save();
    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });
    if (goal.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const { name, targetAmount, savedAmount, deadline, icon } = req.body;
    if (name !== undefined) goal.name = name;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (savedAmount !== undefined) goal.savedAmount = savedAmount;
    if (deadline !== undefined) goal.deadline = deadline;
    if (icon !== undefined) goal.icon = icon;

    await goal.save();
    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });
    if (goal.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
    await goal.deleteOne();
    res.json({ msg: 'Goal removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
