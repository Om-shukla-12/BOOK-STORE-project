import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingCart, FaStar, FaStarHalfAlt, FaInfoCircle, FaRegStar } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './BookCard.css';

const BookCard = ({ book }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const inWishlist = isInWishlist(book._id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(book._id);
    } else {
      addToWishlist(book);
    }
  };

  // Calculate discount percentage
  const discount = book.originalPrice ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100) : 0;

  // Function to handle image loading errors
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/200x300?text=No+Image';
  };

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="star full" />);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half-star" className="star half" />);
    }

    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-star-${i}`} className="star empty" />);
    }

    return stars;
  };

  // Function to format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/200x300?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5001/uploads/${imagePath}`;
  };

  return (
    <article className="book-card">
      <div className="book-image-wrapper">
        <img
          src={getImageUrl(book.image) || 'https://via.placeholder.com/200x300?text=No+Image'}
          alt={`${book.title} cover`}
          className="book-image"
          onError={handleImageError}
        />
        <div className="book-overlay">
          <button className="add-to-cart-btn">
            <FaShoppingCart className="cart-icon" />
            Add to Cart
          </button>
        </div>
        <button
          className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {inWishlist ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>
      
      <div className="book-details">
        <h3 className="book-title" title={book.title}>
          {book.title}
        </h3>
        <p className="book-author" title={book.author}>
          by {book.author}
        </p>
        
        <div className="book-rating">
          <div className="stars-container">
            {renderStars(book.averageRating || 0)}
          </div>
          <span className="rating-value">
            {book.averageRating ? book.averageRating.toFixed(1) : '0.0'}
          </span>
        </div>

        <div className="book-price">
          {formatPrice(book.price)}
        </div>
      </div>

      <div className="price-container">
        <div className="price-details">
          {book.originalPrice && (
            <span className="original-price">{formatPrice(book.originalPrice)}</span>
          )}
          {discount > 0 && (
            <span className="discount-text">{discount}% off</span>
          )}
        </div>
        <div className="action-buttons">
          <Link to={`/books/${book._id}`} className="view-details-btn">
            <FaInfoCircle /> View Details
          </Link>
          <button
            className="add-to-cart-btn"
            onClick={() => addToCart(book)}
          >
            <FaShoppingCart /> Add to Cart
          </button>
        </div>
      </div>

      <div className="delivery-info">
        <span className="delivery-text">Free Delivery</span>
        <span className="delivery-time">Delivery by {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
      </div>
    </article>
  );
};

export default BookCard; 