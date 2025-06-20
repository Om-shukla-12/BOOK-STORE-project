const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  books: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }]
}, {
  timestamps: true
});

// Ensure a user can only have one wishlist
wishlistSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema); 