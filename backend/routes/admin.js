const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard statistics
router.get('/stats', [auth, isAdmin], async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      totalBooks,
      totalUsers,
      totalOrders,
      totalRevenue
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', [auth, isAdmin], async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.put('/users/:id/role', [auth, isAdmin], async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', [auth, isAdmin], async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders
router.get('/orders', [auth, isAdmin], async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.book');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
router.put('/orders/:id/status', [auth, isAdmin], async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('user', 'name email')
     .populate('items.book');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new book
router.post('/books', [auth, isAdmin], async (req, res) => {
  try {
    console.log('Received book data:', req.body); // Debug log

    // Validate required fields
    const requiredFields = ['title', 'author', 'description', 'price', 'stock', 'image', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        fields: missingFields 
      });
    }

    // Validate numeric fields
    if (isNaN(req.body.price) || req.body.price <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    if (isNaN(req.body.stock) || req.body.stock < 0) {
      return res.status(400).json({ message: 'Stock must be a non-negative number' });
    }

    const book = new Book(req.body);
    const savedBook = await book.save();
    console.log('Saved book:', savedBook); // Debug log
    res.status(201).json(savedBook);
  } catch (err) {
    console.error('Book creation error:', err);
    res.status(500).json({ 
      message: 'Server error while creating book',
      error: err.message 
    });
  }
});

// Update book
router.put('/books/:id', [auth, isAdmin], async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete book
router.delete('/books/:id', [auth, isAdmin], async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 