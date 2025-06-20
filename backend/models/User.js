const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true
  },
  cardHolder: {
    type: String,
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  },
  cvv: {
    type: String,
    required: true
  }
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  cart: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }],
  paymentMethods: [PaymentMethodSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Remove password when converting to JSON
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Debug log when model is created
console.log('User model created with schema:', Object.keys(UserSchema.paths));

module.exports = mongoose.model('User', UserSchema); 