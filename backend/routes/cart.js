const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Book = require('../models/Book');

// Debug middleware for cart routes
router.use((req, res, next) => {
  console.log('Cart route accessed:', req.method, req.url);
  next();
});

// @route   GET api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    console.log('GET /api/cart - User ID:', req.user.id);

    const user = await User.findById(req.user.id).populate('cart.book');
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user._id);
    console.log('Cart items:', JSON.stringify(user.cart, null, 2));
    
    // Ensure we're sending a properly formatted response
    const response = {
      items: user.cart || [],
      message: 'Cart retrieved successfully'
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    console.log('POST /api/cart - Book ID:', bookId, 'Quantity:', quantity);

    // Validate input
    if (!bookId || !quantity) {
      return res.status(400).json({ message: 'Please provide book ID and quantity' });
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if book is already in cart
    const cartItemIndex = user.cart.findIndex(item => item.book.toString() === bookId);

    if (cartItemIndex > -1) {
      // Update quantity if book is already in cart
      user.cart[cartItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      user.cart.push({ book: bookId, quantity });
    }

    await user.save();
    await user.populate('cart.book');

    res.json({ items: user.cart });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/cart/:bookId
// @desc    Update cart item quantity
// @access  Private
router.put('/:bookId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { bookId } = req.params;
    console.log('PUT /api/cart/:bookId - Book ID:', bookId, 'New Quantity:', quantity);

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Please provide a valid quantity' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cartItemIndex = user.cart.findIndex(item => item.book.toString() === bookId);
    if (cartItemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    user.cart[cartItemIndex].quantity = quantity;
    await user.save();
    await user.populate('cart.book');

    res.json({ items: user.cart });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/cart/:bookId
// @desc    Remove item from cart
// @access  Private
router.delete('/:bookId', auth, async (req, res) => {
  try {
    const { bookId } = req.params;
    console.log('DELETE /api/cart/:bookId - Book ID:', bookId);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = user.cart.filter(item => item.book.toString() !== bookId);
    await user.save();
    await user.populate('cart.book');

    res.json({ items: user.cart });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Cart routes are working' });
});

module.exports = router; 