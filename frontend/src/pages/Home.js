import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to BookStore</h1>
          <p>Discover your next favorite book from our vast collection</p>
          <Link to="/books" className="button">Browse Books</Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Wide Selection</h3>
          <p>Thousands of books across all genres</p>
        </div>
        <div className="feature-card">
          <h3>Fast Delivery</h3>
          <p>Quick and reliable shipping</p>
        </div>
        <div className="feature-card">
          <h3>Best Prices</h3>
          <p>Competitive prices and regular deals</p>
        </div>
      </section>
    </div>
  );
};

export default Home; 