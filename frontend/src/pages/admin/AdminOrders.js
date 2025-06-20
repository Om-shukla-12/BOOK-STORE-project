import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/orders');
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders');
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5001/api/admin/orders/${orderId}`, { status: newStatus });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-orders">
      <h1>Order Management</h1>
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order._id.slice(-6)}</td>
                <td>{order.user.name}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>${order.total.toFixed(2)}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="action-button view"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleStatusChange(order._id, 'delivered')}
                      className="action-button approve"
                      title="Mark as Delivered"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => handleStatusChange(order._id, 'cancelled')}
                      className="action-button cancel"
                      title="Cancel Order"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-content">
            <h2>Order Details</h2>
            <div className="order-info">
              <p><strong>Order ID:</strong> {selectedOrder._id}</p>
              <p><strong>Customer:</strong> {selectedOrder.user.name}</p>
              <p><strong>Email:</strong> {selectedOrder.user.email}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>
            </div>
            <div className="order-items">
              <h3>Items</h3>
              {selectedOrder.items.map(item => (
                <div key={item._id} className="order-item">
                  <img src={item.book.image} alt={item.book.title} />
                  <div className="item-details">
                    <h4>{item.book.title}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={closeOrderDetails} className="close-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
