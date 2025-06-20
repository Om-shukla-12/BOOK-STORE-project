const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/payment-methods
// @desc    Get user's payment methods
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('paymentMethods');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.paymentMethods || []);
  } catch (err) {
    console.error('Error fetching payment methods:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/payment-methods
// @desc    Add a new payment method
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { cardNumber, cardHolder, expiryDate, cvv } = req.body;

    // Validate required fields
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if card already exists
    const cardExists = user.paymentMethods.some(
      method => method.cardNumber === cardNumber
    );

    if (cardExists) {
      return res.status(400).json({ message: 'Card already exists' });
    }

    // Add new payment method
    user.paymentMethods.push({
      cardNumber,
      cardHolder,
      expiryDate,
      cvv
    });

    await user.save();
    res.json(user.paymentMethods);
  } catch (err) {
    console.error('Error adding payment method:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/payment-methods/:id
// @desc    Delete a payment method
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const paymentMethod = user.paymentMethods.id(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    paymentMethod.remove();
    await user.save();
    res.json({ message: 'Payment method removed' });
  } catch (err) {
    console.error('Error removing payment method:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 