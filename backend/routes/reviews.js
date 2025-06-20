const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

// Get reviews for a book
router.get('/book/:bookId', async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    res.json({
      reviews,
      averageRating: avgRating || 0,
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a review
router.post('/book/:bookId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const bookId = req.params.bookId;

    // Check if user has already reviewed this book
    const existingReview = await Review.findOne({
      user: req.user._id,
      book: bookId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    const review = await Review.create({
      user: req.user._id,
      book: bookId,
      rating,
      comment
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name');

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a review
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const { rating, comment } = req.body;
    review.rating = rating;
    review.comment = comment;
    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('user', 'name');

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a review
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.remove();
    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 