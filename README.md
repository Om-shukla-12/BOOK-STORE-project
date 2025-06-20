# Book Store Application

A modern web application for browsing and purchasing books online.

## Features

- Browse books by category
- Search and filter books
- User authentication
- Shopping cart functionality
- Order management
- Responsive design

## Tech Stack

### Frontend
- React
- React Router
- Axios
- CSS3

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd book-store
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/bookstore
JWT_SECRET=your_jwt_secret
PORT=5000
```

5. Start the backend server:
```bash
cd backend
npm run dev
```

6. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Books
- GET /api/books - Get all books
- GET /api/books/:id - Get a specific book
- POST /api/books - Create a new book
- PUT /api/books/:id - Update a book
- DELETE /api/books/:id - Delete a book

### Users
- POST /api/users/register - Register a new user
- POST /api/users/login - Login user
- GET /api/users/profile - Get user profile

### Orders
- POST /api/orders - Create a new order
- GET /api/orders - Get user orders
- GET /api/orders/:id - Get specific order

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 