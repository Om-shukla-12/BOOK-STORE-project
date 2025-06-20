import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>BookStore</h3>
          <p>Your one-stop shop for all your reading needs.</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/books">Books</Link>
          <Link to="/cart">Cart</Link>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: info@bookstore.com</p>
          <p>Phone: (123) 456-7890</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 BookStore. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 