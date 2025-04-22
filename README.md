# Airline Ticket Booking System

A modern web application for booking airline tickets online. Built with React, Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Search for flights based on destination and date
- View flight details and pricing
- Book tickets with seat selection
- Manage bookings
- User profile management
- Admin dashboard for flight management

## Tech Stack

- Frontend: React.js, Material-UI
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client
   npm install
   ```
3. Create a .env file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the development server:
   ```bash
   # Run backend only
   npm run dev
   
   # Run frontend only
   npm run client
   
   # Run both frontend and backend
   npm run dev:full
   ```

## API Endpoints

- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/flights - Get all flights
- GET /api/flights/:id - Get specific flight
- POST /api/bookings - Create new booking
- GET /api/bookings - Get user bookings

## Contributing

Feel free to submit issues and enhancement requests. 