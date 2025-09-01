# Waggr - Dog Walking Matchmaker 🐕✨

## Overview

Waggr is a modern web application that helps dog lovers find their perfect walking companions. Swipe through adorable adoptable dogs, save your favorites, and schedule walks—all in one intuitive platform.

## Features

###  **Dog Discovery**
- Swipe through curated dogs from PetFinder API
- Like or pass with intuitive card interface
- View detailed dog profiles with photos and information

###  **Matches Management** 
- Save and organize your favorite dogs
- One-click booking integration with Calendly
- Easy match clearing functionality

###  **User Profiles**
- Secure user registration and authentication
- Personalized profile management
- Edit user information seamlessly

###  **Security**
- Protected routes for authenticated users only
- JWT-based authentication
- Secure password hashing

## Tech Stack

### Frontend
- **React** with modern hooks
- **React Router** for navigation
- **CSS3** with responsive design
- **Custom components** for swipe interface

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **bcrypt** password hashing

### APIs Integrated
- **PetFinder API** - Dog data and images
- **Calendly** - Walk scheduling integration

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- PetFinder API credentials
- Calendly account



### Backend Setup
```bash
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Add your database and API credentials

# Start the server
npm start
```


### API Endpoints

Authentication
POST /auth/register - User registration

POST /auth/token - User login

GET /auth/verify - Token verification

Dogs
GET /dogs - Get paginated dogs list

GET /dogs/:id - Get specific dog details

User Management
GET /users/:username - Get user profile

PATCH /users/:username - Update user profile

Matches
GET /matches - Get user's liked dogs

POST /matches/:dogId - Add dog to matches

DELETE /matches/:dogId - Remove dog from matches

Usage
Sign Up/Login: Create an account or log in to access full features

Discover Dogs: Swipe through dogs in the swipe interface

Save Favorites: Like dogs to save them to your matches

Schedule Walks: Book walks with your matched dogs via Calendly

Manage Profile: Update your personal information anytime

### Project Structure

waggr/
├── backend/
│   ├── __tests__/          # Test suites
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   └── config/             # Configuration files
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   └── utils/         # Helper functions
│   └── public/            # Static assets
└── README.md
Environment Variables
env

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/waggr

# JWT
SECRET_KEY=your-secret-key

# PetFinder API
PETFINDER_CLIENT_ID=your-client-id
PETFINDER_CLIENT_SECRET=your-client-secret

# App
PORT=3001
NODE_ENV=development
Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

License
This project is licensed under the MIT License - see the LICENSE.md file for details.

Acknowledgments
PetFinder API for dog data

Calendly for scheduling integration

React community for excellent documentation and tools

Support
For support or questions, please open an issue in the GitHub repository or contact our development team.

Waggr - Find your perfect walking buddy today!