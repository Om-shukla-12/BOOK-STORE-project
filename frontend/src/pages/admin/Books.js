import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import './Books.css';

const RatingStars = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} className="star full" />);
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="star half" />);
  }

  // Add empty stars
  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaStar key={`empty-${i}`} className="star empty" />);
  }

  return (
    <div className="rating-stars">
      {stars}
      <span className="rating-value">{rating.toFixed(1)}</span>
    </div>
  );
};

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: ''
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/books', {
        headers: { 'x-auth-token': token }
      });
      setBooks(response.data);
    } catch (err) {
      console.error('Books Error:', err);
      setError('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/books', formData, {
        headers: { 'x-auth-token': token }
      });
      setFormData({
        title: '',
        author: '',
        description: '',
        price: '',
        image: '',
        category: '',
        stock: ''
      });
      fetchBooks();
    } catch (err) {
      console.error('Add Book Error:', err);
      setError('Failed to add book');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5001/api/books/${id}`, {
          headers: { 'x-auth-token': token }
        });
        fetchBooks();
      } catch (err) {
        console.error('Delete Book Error:', err);
        setError('Failed to delete book');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-books">
      <h1>Manage Books</h1>
      
      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Author:</label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({...formData, author: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Price:</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Image URL:</label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({...formData, image: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Category:</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Stock:</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="submit-button">Add Book</button>
      </form>

      <div className="books-list">
        <h2>Existing Books</h2>
        <div className="books-grid">
          {books.map((book) => (
            <div key={book._id} className="book-card">
              <div className="book-image">
                <img src={book.image} alt={book.title} />
              </div>
              <div className="book-info">
                <h3>{book.title}</h3>
                <p className="author">By {book.author}</p>
                <p className="description">{book.description}</p>
                <div className="book-meta">
                  <p className="price">${book.price.toFixed(2)}</p>
                  <p className="stock">Stock: {book.stock}</p>
                </div>
                <div className="book-rating">
                  <RatingStars rating={book.averageRating || 0} />
                  <span className="total-ratings">
                    {book.totalRatings || 0} {book.totalRatings === 1 ? 'rating' : 'ratings'}
                  </span>
                </div>
                <div className="book-actions">
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(book._id)}
                  >
                    <FaTrash /> Delete Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBooks; 