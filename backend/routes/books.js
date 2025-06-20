const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Book = require('../models/Book');

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find()
      .select('title author description price image category stock averageRating totalRatings')
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create book
router.post('/', async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    description: req.body.description,
    price: req.body.price,
    image: req.body.image,
    category: req.body.category,
    stock: req.body.stock
  });

  try {
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update book
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    Object.assign(book, req.body);
    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    await book.remove();
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add rating to a book
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user has already rated this book
    const existingRatingIndex = book.ratings.findIndex(
      r => r.user.toString() === req.user.id
    );

    if (existingRatingIndex > -1) {
      // Update existing rating
      book.ratings[existingRatingIndex] = {
        user: req.user.id,
        rating,
        review,
        createdAt: Date.now()
      };
    } else {
      // Add new rating
      book.ratings.push({
        user: req.user.id,
        rating,
        review
      });
    }

    await book.save();
    res.json(book);
  } catch (err) {
    console.error('Rating error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get book ratings
router.get('/:id/ratings', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('ratings.user', 'name')
      .select('ratings averageRating totalRatings');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({
      ratings: book.ratings,
      averageRating: book.averageRating,
      totalRatings: book.totalRatings
    });
  } catch (err) {
    console.error('Get ratings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 