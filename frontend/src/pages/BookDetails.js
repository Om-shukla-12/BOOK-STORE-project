import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaShoppingCart, FaArrowLeft, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config';
import './BookDetails.css';

const RatingStars = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} className="star full" />);
  }

  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="star half" />);
  }

  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} className="star empty" />);
  }

  return <div className="rating-stars">{stars}</div>;
};

const ReviewForm = ({ bookId, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    try {
      const response = await axios.post(
        `/api/reviews/book/${bookId}`,
        { rating, comment },
        { withCredentials: true }
      );
      onReviewSubmit(response.data);
      setRating(0);
      setComment('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Write a Review</h3>
      {error && <div className="error">{error}</div>}
      <div className="rating-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`star ${star <= (hoveredRating || rating) ? 'full' : 'empty'}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
          />
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review here..."
        rows="4"
      />
      <button type="submit" className="btn btn-primary">
        Submit Review
      </button>
    </form>
  );
};

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS.BOOKS.DETAIL(id)}`);
        setBook(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError(err.response?.data?.message || 'Failed to fetch book details');
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const handleReviewSubmit = (newReview) => {
    setReviews([newReview, ...reviews]);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(book._id, 1);
      alert('Book added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add book to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="button" onClick={() => navigate('/books')}>
          Back to Books
        </button>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="book-details">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <div className="book-details-container">
        <div className="book-image-container">
          <img src={book.image} alt={book.title} className="book-image" />
        </div>

        <div className="book-info">
          <h1 className="book-title">{book.title}</h1>
          <Link to={`/author/${encodeURIComponent(book.author)}`} className="author-link">
            by {book.author}
          </Link>

          <div className="book-rating">
            <RatingStars rating={book.averageRating || 0} />
            <span className="rating-number">
              ({book.totalRatings || 0} reviews)
            </span>
          </div>

          <p className="book-description">{book.description}</p>

          <div className="book-meta">
            <div className="meta-item">
              <span className="meta-label">Category:</span>
              <span className="meta-value">{book.category}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Pages:</span>
              <span className="meta-value">{book.pages || 'N/A'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Language:</span>
              <span className="meta-value">{book.language || 'English'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Stock:</span>
              <span className="meta-value">{book.stock || 0} available</span>
            </div>
          </div>

          <div className="book-price">
            <span className="current-price">₹{book.price.toFixed(2)}</span>
            {book.originalPrice && (
              <span className="original-price">₹{book.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <button 
            className="add-to-cart-button" 
            onClick={handleAddToCart}
            disabled={addingToCart || !book.stock}
          >
            <FaShoppingCart /> 
            {addingToCart ? 'Adding...' : book.stock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Customer Reviews</h2>
        {isAuthenticated && <ReviewForm bookId={id} onReviewSubmit={handleReviewSubmit} />}
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this book!</p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-name">{review.user.name}</span>
                    <RatingStars rating={review.rating} />
                  </div>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails; 