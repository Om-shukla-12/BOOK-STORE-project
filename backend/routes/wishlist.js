const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('books');

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        books: []
      });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add book to wishlist
router.post('/add/:bookId', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        books: [book._id]
      });
    } else {
      if (!wishlist.books.includes(book._id)) {
        wishlist.books.push(book._id);
        await wishlist.save();
      }
    }

    wishlist = await Wishlist.findById(wishlist._id).populate('books');
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove book from wishlist
router.delete('/remove/:bookId', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.books = wishlist.books.filter(
      bookId => bookId.toString() !== req.params.bookId
    );
    await wishlist.save();

    const updatedWishlist = await Wishlist.findById(wishlist._id).populate('books');
    res.json(updatedWishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if book is in wishlist
router.get('/check/:bookId', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.json({ inWishlist: false });
    }

    const inWishlist = wishlist.books.some(
      bookId => bookId.toString() === req.params.bookId
    );
    res.json({ inWishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 