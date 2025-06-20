import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaPaypal, FaLock, FaSpinner } from 'react-icons/fa';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('new');
  const [paymentType, setPaymentType] = useState('credit'); // 'credit' or 'paypal'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'cod', // Default to COD
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Load cart items from localStorage
        const storedItems = localStorage.getItem('checkoutItems');
        if (!storedItems) {
          navigate('/cart');
          return;
        }
        setCartItems(JSON.parse(storedItems));

        // Load saved payment methods
        try {
          const response = await axios.get(
            'http://localhost:5001/api/payment-methods',
            {
              headers: {
                'x-auth-token': token
              }
            }
          );
          setSavedPaymentMethods(response.data);
        } catch (error) {
          console.log('No saved payment methods found');
          setSavedPaymentMethods([]);
        }
      } catch (error) {
        console.error('Error loading checkout data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
          return;
        }
        setError('Failed to load checkout data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.book.price * item.quantity), 0);
  };

  const formatCardNumber = (number) => {
    return `**** **** **** ${number.slice(-4)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Validate form data
      if (!formData.fullName || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
        setError('Please fill in all shipping information');
        setLoading(false);
        return;
      }

      if (formData.paymentMethod === 'credit' && (!formData.cardNumber || !formData.expiryDate || !formData.cvv)) {
        setError('Please fill in all credit card information');
        setLoading(false);
        return;
      }

      const orderData = {
        items: cartItems.map(item => ({
          book: item.book._id,
          quantity: item.quantity,
          price: item.book.price
        })),
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        paymentMethod: {
          type: formData.paymentMethod,
          ...(formData.paymentMethod === 'credit' && {
            cardNumber: formData.cardNumber,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv
          })
        },
        totalAmount: calculateTotal()
      };

      console.log('Submitting order:', orderData);

      const response = await axios.post(
        'http://localhost:5001/api/orders',
        orderData,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );

      console.log('Order response:', response.data);

      // Clear cart and checkout items
      localStorage.removeItem('cart');
      localStorage.removeItem('checkoutItems');

      // Show success message
      alert('Order placed successfully!');

      // Navigate to order history page
      navigate('/orders');
    } catch (error) {
      console.error('Checkout Error:', error);
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="checkout-container">
        <h1>Checkout</h1>
        {error && <div className="error-message">{error}</div>}
        
        <div className="checkout-content">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h2>Shipping Information</h2>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-type-selector">
                <button
                  type="button"
                  className={`payment-type-btn ${formData.paymentMethod === 'cod' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                >
                  <i className="fas fa-money-bill-wave"></i>
                  Cash on Delivery
                </button>
                <button
                  type="button"
                  className={`payment-type-btn ${formData.paymentMethod === 'credit' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, paymentMethod: 'credit' })}
                >
                  <i className="fas fa-credit-card"></i>
                  Credit Card
                </button>
              </div>

              {formData.paymentMethod === 'credit' && (
                <>
                  {savedPaymentMethods.length > 0 && (
                    <div className="saved-payment-methods">
                      <h3>Saved Payment Methods</h3>
                      {savedPaymentMethods.map((method, index) => (
                        <div
                          key={index}
                          className={`saved-payment-method ${
                            selectedPaymentMethod === method ? 'selected' : ''
                          }`}
                          onClick={() => setSelectedPaymentMethod(method)}
                        >
                          <FaCreditCard />
                          <span>{formatCardNumber(method.cardNumber)}</span>
                        </div>
                      ))}
                      <div
                        className={`saved-payment-method ${
                          selectedPaymentMethod === 'new' ? 'selected' : ''
                        }`}
                        onClick={() => setSelectedPaymentMethod('new')}
                      >
                        <FaCreditCard />
                        <span>Use New Card</span>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'new' && (
                    <div className="payment-form">
                      <div className="form-group">
                        <label htmlFor="cardNumber">Card Number</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          required
                          maxLength="16"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="expiryDate">Expiry Date</label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            required
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cvv">CVV</label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            required
                            maxLength="3"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="secure-payment">
                <FaLock /> Secure Payment
              </div>
            </div>

            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="order-items">
                {cartItems.map((item) => (
                  <div key={item.book._id} className="order-item">
                    <img src={item.book.image} alt={item.book.title} />
                    <div className="item-details">
                      <h3>{item.book.title}</h3>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${item.book.price}</p>
                    </div>
                    <div className="item-total">
                      ${(item.book.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button type="submit" className="place-order-button" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="spinner" /> Processing...
                </>
              ) : (
                <>
                  <FaLock /> Place Order
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 