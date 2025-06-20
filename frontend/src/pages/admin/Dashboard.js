import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBook, FaUsers, FaShoppingCart, FaMoneyBillWave } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!isAuthenticated || user?.role !== 'admin') {
          navigate('/login');
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/admin/stats', {
          headers: {
            'x-auth-token': token
          }
        });
        setStats(response.data);
      } catch (err) {
        console.error('Dashboard Error:', err);
        if (err.response?.status === 401) {
          navigate('/login');
        } else if (err.response?.status === 403) {
          navigate('/');
        } else {
          setError('Failed to fetch dashboard statistics');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, user, navigate]);

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
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <FaBook className="stat-icon" />
          <div className="stat-info">
            <h3>Total Books</h3>
            <p>{stats.totalBooks}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <FaUsers className="stat-icon" />
          <div className="stat-info">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <FaShoppingCart className="stat-icon" />
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <FaMoneyBillWave className="stat-icon" />
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p>${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/books" className="action-button">
            Manage Books
          </Link>
          <Link to="/admin/orders" className="action-button">
            Manage Orders
          </Link>
          <Link to="/admin/users" className="action-button">
            Manage Users
          </Link>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {/* Activity items will be added here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 