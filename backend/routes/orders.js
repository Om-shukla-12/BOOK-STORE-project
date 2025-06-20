const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');

// Get all orders for a user
router.get('/', auth, async (req, res) => {
  try {
    console.log('GET /api/orders - User ID:', req.user.id);
    
    // First check if user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'items.book',
        select: 'title author price image',
        model: 'Book'
      })
      .sort({ createdAt: -1 });
    
    console.log('Found orders:', orders.length);
    res.json(orders);
  } catch (err) {
    console.error('Error in GET /api/orders:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.book', 'title author price image');
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Track order by tracking number
router.get('/track/:trackingNumber', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ trackingNumber: req.params.trackingNumber })
      .populate('items.book', 'title author price image');
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating new order for user:', req.user.id);
    console.log('Order data:', req.body);

    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

    // Validate required fields
    if (!items || !shippingAddress || !paymentMethod || !totalAmount) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          items: !items,
          shippingAddress: !shippingAddress,
          paymentMethod: !paymentMethod,
          totalAmount: !totalAmount
        }
      });
    }

    // Validate items and update book stock
    for (const item of items) {
      console.log('Processing item:', item);
      const book = await Book.findById(item.book);
      if (!book) {
        console.log('Book not found:', item.book);
        return res.status(404).json({ message: `Book not found: ${item.book}` });
      }
      if (book.stock < item.quantity) {
        console.log('Insufficient stock for book:', book.title);
        return res.status(400).json({ message: `Insufficient stock for book: ${book.title}` });
      }
      // Update book stock
      book.stock -= item.quantity;
      await book.save();
      console.log('Updated stock for book:', book.title, 'New stock:', book.stock);
    }

    const newOrder = new Order({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod: {
        type: paymentMethod.type,
        paymentStatus: 'pending',
        ...(paymentMethod.type === 'credit' && {
          cardNumber: paymentMethod.cardNumber,
          expiryDate: paymentMethod.expiryDate,
          cvv: paymentMethod.cvv
        })
      },
      totalAmount,
      trackingHistory: [{
        status: 'processing',
        description: 'Order received and is being processed'
      }]
    });

    console.log('Saving new order');
    const order = await newOrder.save();
    console.log('Order saved successfully:', order._id);

    // Clear user's cart
    const user = await User.findById(req.user.id);
    if (user) {
      user.cart = [];
      await user.save();
      console.log('User cart cleared');
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ 
      message: 'Failed to create order',
      error: err.message
    });
  }
});

// Update order status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, location, description } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    order.status = status;
    order.trackingHistory.push({
      status,
      location,
      description
    });

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Only allow cancellation if order is still processing
    if (order.status !== 'processing') {
      return res.status(400).json({ msg: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    order.trackingHistory.push({
      status: 'cancelled',
      description: 'Order cancelled by user'
    });

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router; 