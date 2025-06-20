const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  items: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    }
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['credit', 'paypal', 'cod'],
      required: true
    },
    cardNumber: String,
    expiryDate: String,
    cvv: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  trackingNumber: {
    type: String,
    unique: true
  },
  trackingHistory: [{
    status: {
      type: String,
      required: true
    },
    location: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate tracking number before saving
OrderSchema.pre('save', function(next) {
  if (!this.trackingNumber) {
    this.trackingNumber = 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('order', OrderSchema); 