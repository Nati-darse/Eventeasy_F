# Event Easy: Professional Event Management Platform

## 🎯 Project Overview

Event Easy is a comprehensive, full-stack event management platform built with modern web technologies. It provides a seamless experience for event discovery, organization, and management with a focus on user experience, security, and scalability.

## 🏗️ Architecture & Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **File Storage**: Cloudinary for media management
- **Email Service**: Nodemailer with SMTP
- **Validation**: Express-validator for request validation
- **Security**: CORS, cookie-parser, helmet (recommended)

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Context API with custom hooks
- **Routing**: React Router DOM
- **HTTP Client**: Axios with interceptors
- **Animations**: Framer Motion
- **Icons**: Lucide React & React Icons
- **Date Handling**: date-fns

## 📁 Project Structure

```
event-easy/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   │   ├── database.js   # MongoDB connection
│   │   │   ├── cloudinary.js # Cloud storage config
│   │   │   └── email.js      # Email service config
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Custom middleware
│   │   │   ├── auth.js       # Authentication middleware
│   │   │   ├── validation.js # Request validation
│   │   │   └── upload.js     # File upload handling
│   │   ├── models/           # Database models
│   │   │   ├── User.js       # User model with methods
│   │   │   ├── Event.js      # Event model with geospatial
│   │   │   ├── Review.js     # Review model
│   │   │   └── Report.js     # Report model
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic services
│   │   │   └── AuthService.js # Authentication service
│   │   └── utils/            # Utility functions
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── common/       # Common UI components
│   │   │   ├── forms/        # Form components
│   │   │   └── layout/       # Layout components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useAuth.js    # Authentication hook
│   │   │   └── useEvents.js  # Events management hook
│   │   ├── services/         # API services
│   │   │   └── api.js        # Centralized API client
│   │   ├── utils/            # Utility functions
│   │   │   ├── constants.js  # Application constants
│   │   │   └── helpers.js    # Helper functions
│   │   ├── context/          # React context providers
│   │   └── assets/           # Static assets
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Features

### Core Functionality
- **User Management**: Registration, authentication, email verification
- **Event Management**: Create, read, update, delete events with media support
- **Location Services**: Geospatial event discovery and mapping
- **Review System**: Rate and review events with moderation
- **Reporting System**: Report inappropriate content with admin workflow
- **Admin Dashboard**: Comprehensive admin panel with analytics

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Live event status and notification system
- **File Upload**: Secure image and video upload with validation
- **Search & Filter**: Advanced event discovery with multiple filters
- **Security**: JWT authentication, input validation, XSS protection
- **Performance**: Optimized queries, lazy loading, caching strategies

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account for media storage
- Email service credentials (Gmail/SMTP)

### Backend Setup

1. **Clone and navigate to backend**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/event-easy
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   SALT_ROUNDS=12
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Email Service
   SENDER_EMAIL=your-email@gmail.com
   SENDER_PASS=your-app-password
   
   # Server
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend and install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Create .env file
   echo "VITE_API_URL=http://localhost:5000" > .env
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Development Guidelines

### Code Style & Standards
- **ES6+ Features**: Use modern JavaScript features
- **Async/Await**: Prefer async/await over promises
- **Error Handling**: Comprehensive error handling with try-catch
- **Documentation**: JSDoc comments for all functions and classes
- **Naming Conventions**: camelCase for variables, PascalCase for components

### Backend Patterns
- **Service Layer**: Business logic separated from controllers
- **Middleware**: Reusable middleware for common operations
- **Validation**: Input validation using express-validator
- **Error Handling**: Centralized error handling middleware
- **Security**: Input sanitization and rate limiting

### Frontend Patterns
- **Component Structure**: Functional components with hooks
- **State Management**: Context API with custom hooks
- **API Integration**: Centralized API service with interceptors
- **Error Boundaries**: React error boundaries for error handling
- **Performance**: React.memo, useMemo, useCallback for optimization

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['attendee', 'organizer', 'admin'],
  isVerified: Boolean,
  profilePicture: { public_id, url },
  preferences: { categories, notifications },
  timestamps: true
}
```

### Event Model
```javascript
{
  eventName: String,
  time: Date,
  category: String (enum),
  description: String,
  location: { type: 'Point', coordinates: [lng, lat] },
  organizer: ObjectId (ref: User),
  attendees: [ObjectId] (ref: User),
  status: ['pending', 'approved', 'rejected'],
  imageUrl: { public_id, url },
  videoUrl: { public_id, url },
  capacity: Number,
  price: { amount, currency },
  timestamps: true
}
```

## 🔐 Security Measures

- **Authentication**: JWT tokens with secure HTTP-only cookies
- **Password Security**: bcrypt hashing with configurable salt rounds
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: File type and size validation
- **CORS Configuration**: Restricted cross-origin requests
- **Rate Limiting**: API rate limiting to prevent abuse
- **XSS Protection**: Input sanitization and output encoding

## 🚀 Deployment

### Backend Deployment
1. **Environment Setup**: Configure production environment variables
2. **Database**: Set up MongoDB Atlas or production database
3. **File Storage**: Configure Cloudinary for production
4. **Server**: Deploy to Heroku, DigitalOcean, or AWS

### Frontend Deployment
1. **Build**: `npm run build`
2. **Static Hosting**: Deploy to Vercel, Netlify, or AWS S3
3. **Environment**: Configure production API endpoints

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Jest for service and utility functions
- **Integration Tests**: Supertest for API endpoint testing
- **Database Tests**: MongoDB Memory Server for isolated testing

### Frontend Testing
- **Component Tests**: React Testing Library
- **Hook Tests**: Custom hook testing utilities
- **E2E Tests**: Cypress for end-to-end testing

## 📈 Performance Optimization

### Backend Optimization
- **Database Indexing**: Proper indexing for query optimization
- **Caching**: Redis for session and data caching
- **Compression**: Gzip compression for responses
- **Connection Pooling**: MongoDB connection pooling

### Frontend Optimization
- **Code Splitting**: Dynamic imports for route-based splitting
- **Image Optimization**: Lazy loading and responsive images
- **Bundle Analysis**: Webpack bundle analyzer for optimization
- **Caching**: Service worker for offline functionality

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Contribution Guidelines
- Follow the established code style and patterns
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 📝 API Documentation

### Authentication Endpoints
```
POST /Event-Easy/users/register     # User registration
POST /Event-Easy/users/login        # User login
POST /Event-Easy/users/logout       # User logout
POST /Event-Easy/users/verify-otp   # Email verification
GET  /Event-Easy/users/is-auth      # Check authentication
```

### Event Endpoints
```
GET    /Event-Easy/Event/events           # Get all events
POST   /Event-Easy/Event/createEvents     # Create new event
GET    /Event-Easy/Event/events/:id       # Get event by ID
PUT    /Event-Easy/Event/events/:id       # Update event
DELETE /Event-Easy/Event/events/:id       # Delete event
POST   /Event-Easy/Event/events/:id/attend # Attend event
```

## 🐛 Troubleshooting

### Common Issues
1. **MongoDB Connection**: Ensure MongoDB is running and connection string is correct
2. **Cloudinary Upload**: Verify API credentials and network connectivity
3. **Email Service**: Check SMTP credentials and app password setup
4. **CORS Errors**: Ensure frontend URL is whitelisted in backend CORS config

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` and checking console outputs.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Development**: Node.js, Express.js, MongoDB
- **Frontend Development**: React, Tailwind CSS, Framer Motion
- **DevOps**: Deployment, CI/CD, Monitoring
- **Design**: UI/UX, Responsive Design, Accessibility

## 🙏 Acknowledgments

- **MongoDB**: For the robust database solution
- **Cloudinary**: For reliable media storage and optimization
- **Tailwind CSS**: For the utility-first CSS framework
- **React Community**: For the excellent ecosystem and tools

---

**Event Easy** - Transforming event management in Ethiopia with modern web technologies.

For support or questions, please open an issue or contact the development team.