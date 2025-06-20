import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Books.css';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [addingToCart, setAddingToCart] = useState({});
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/books');
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(books.map(book => book.category))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = async (bookId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setAddingToCart(prev => ({ ...prev, [bookId]: true }));
    try {
      await addToCart(bookId, 1);
      alert('Book added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add book to cart. Please try again.');
    } finally {
      setAddingToCart(prev => ({ ...prev, [bookId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="books-page">
        <div className="loading-spinner">Loading books...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="books-page">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="books-page">
      <div className="books-header">
        <h1>Our Books</h1>
        <div className="books-controls">
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="books-grid">
        {filteredBooks.map(book => (
          <div key={book._id} className="book-card">
            <img src={book.image} alt={book.title} className="book-cover" />
            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="author">by {book.author}</p>
              <p className="price">${book.price.toFixed(2)}</p>
              <div className="book-rating">
                {'★'.repeat(Math.floor(book.averageRating || 0))}
                {'☆'.repeat(5 - Math.floor(book.averageRating || 0))}
                <span>({book.averageRating ? book.averageRating.toFixed(1) : 'No ratings'})</span>
              </div>
              <div className="book-actions">
                <Link to={`/books/${book._id}`} className="button button-secondary">
                  View Details
                </Link>
                <button
                  onClick={() => handleAddToCart(book._id)}
                  className="button button-primary"
                  disabled={addingToCart[book._id]}
                >
                  {addingToCart[book._id] ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Books; 