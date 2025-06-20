import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, setAuthUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number') return '$0.00';
    return `$${price.toFixed(2)}`;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user profile
        const profileResponse = await axios.get(API_ENDPOINTS.AUTH.USER, {
          headers: {
            'x-auth-token': token
          }
        });

        // Update form data with user info
        setFormData({
          name: profileResponse.data.name || '',
          email: profileResponse.data.email || ''
        });

        // Fetch user orders
        const ordersResponse = await axios.get('/api/orders', {
          headers: {
            'x-auth-token': token
          }
        });
        setOrders(ordersResponse.data || []);
      } catch (error) {
        console.error('Fetch Error:', error);
        if (error.response?.status === 401) {
          navigate('/login');
          return;
        }
        setError(error.response?.data?.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, isAuthenticated]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

      const response = await axios.put(
        API_ENDPOINTS.AUTH.USER,
        formData,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );

      // Update auth context with new user data
      setAuthUser(response.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Update Profile Error:', error);
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/')} className="home-button">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-container">
        <h1>My Profile</h1>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your name"
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
                placeholder="Enter your email"
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="save-button" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: authUser?.name || '',
                    email: authUser?.email || ''
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="profile-header">
              <div className="profile-avatar">
                {getInitials(authUser?.name)}
              </div>
              <div className="profile-details">
                <div className="info-group">
                  <label>Name:</label>
                  <p>{authUser?.name || 'N/A'}</p>
                </div>
                <div className="info-group">
                  <label>Email:</label>
                  <p>{authUser?.email || 'N/A'}</p>
                </div>
                <div className="info-group">
                  <label>Member Since:</label>
                  <p>{formatDate(authUser?.createdAt)}</p>
                </div>
                <button
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="orders-section">
          <h2>Order History</h2>
          {orders.length > 0 ? (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <span>Order #{order._id}</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="order-details">
                    <p>
                      <span>Status:</span>
                      <span>{order.status || 'Pending'}</span>
                    </p>
                    <p>
                      <span>Total:</span>
                      <span>{formatPrice(order.total)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-orders">No orders found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 