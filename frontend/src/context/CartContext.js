import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { API_ENDPOINTS } from '../config';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { isAuthenticated } = useAuth();
  const { loading, error, apiCall } = useApi();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await apiCall('get', API_ENDPOINTS.CART.GET);
      setCart(response.items || []);
    } catch (error) {
      console.error('Cart fetch error:', error);
      setCart([]);
    }
  };

  const addToCart = async (bookId, quantity = 1) => {
    try {
      const response = await apiCall('post', API_ENDPOINTS.CART.ADD, { bookId, quantity });
      setCart(response.items || []);
      return response.items;
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  };

  const removeFromCart = async (bookId) => {
    try {
      const response = await apiCall('delete', `${API_ENDPOINTS.CART.REMOVE}/${bookId}`);
      setCart(response.items || []);
      return response.items;
    } catch (error) {
      console.error('Remove from cart error:', error);
      throw error;
    }
  };

  const updateQuantity = async (bookId, quantity) => {
    try {
      const response = await apiCall('put', `${API_ENDPOINTS.CART.UPDATE}/${bookId}`, { quantity });
      setCart(response.items || []);
      return response.items;
    } catch (error) {
      console.error('Update cart error:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      // Since we don't have a clear cart endpoint, we'll remove items one by one
      const cartItems = [...cart];
      for (const item of cartItems) {
        await removeFromCart(item.book._id);
      }
      setCart([]);
      return [];
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = item.book?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };

  if (loading) {
    return <LoadingSpinner message="Loading cart..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchCart} />;
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
