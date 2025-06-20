import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaShoppingCart, FaTrash, FaArrowLeft } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      console.log('Fetching cart with token:', token);
      
      const response = await axios.get('http://localhost:5001/api/cart', {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Cart response:', JSON.stringify(response.data, null, 2));
      console.log('Cart items:', response.data.items);
      console.log('Cart items length:', response.data.items?.length);
      setCartItems(response.data.items || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
      let errorMessage = 'Failed to load cart';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', err.response.data);
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        errorMessage = 'No response from server';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', err.message);
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const updateQuantity = async (bookId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Updating quantity for book:', bookId, 'to:', newQuantity);
      
      const response = await axios.put(
        `http://localhost:5001/api/cart/${bookId}`,
        { quantity: newQuantity },
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Update response:', response.data);
      setCartItems(response.data.items);
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity');
    }
  };

  const removeItem = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Removing book from cart:', bookId);
      
      const response = await axios.delete(
        `http://localhost:5001/api/cart/${bookId}`,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Remove response:', response.data);
      setCartItems(response.data.items);
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.book.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    // Store cart items in localStorage for checkout
    localStorage.setItem('checkoutItems', JSON.stringify(cartItems));
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchCartItems} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1><FaShoppingCart /> Shopping Cart</h1>
        <button onClick={() => navigate('/books')} className="continue-shopping">
          <FaArrowLeft /> Continue Shopping
        </button>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <FaShoppingCart className="empty-cart-icon" />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any books to your cart yet.</p>
          <button onClick={() => navigate('/books')} className="browse-books-button">
            Browse Books
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.book._id} className="cart-item">
                <img src={item.book.image} alt={item.book.title} />
                <div className="item-details">
                  <h3>{item.book.title}</h3>
                  <p className="author">by {item.book.author}</p>
                  <p className="price">${item.book.price}</p>
                </div>
                <div className="quantity-controls">
                  <button
                    onClick={() => updateQuantity(item.book._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.book._id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.book._id)}
                  className="remove-button"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout} 
              className="checkout-button"
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart; 