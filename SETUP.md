# Authentication Setup Guide

## Backend Integration

This React app is configured to work with your Node.js backend authentication system. Here's how to set it up:

### 1. Environment Configuration

Create a `.env` file in your React project root with the following content:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Development settings
NODE_ENV=development
```

### 2. Backend API Endpoints

Make sure your backend has the following endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires JWT token)

### 3. Backend CORS Configuration

Ensure your backend has CORS enabled for your React app:

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // Your React app URL
  credentials: true
}));
```

### 4. JWT Secret

Make sure your backend has a JWT_SECRET environment variable set:

```env
JWT_SECRET=your-super-secret-jwt-key
```

## Features

### Authentication Service (`src/services/authService.js`)
- User registration with role support
- User login with JWT token management
- Automatic token storage in localStorage
- Current user profile fetching
- Token validation and cleanup

### Custom Hook (`src/hooks/useAuth.js`)
- React hook for authentication state management
- Automatic authentication check on app load
- Loading states and error handling
- User session management

### Components
- **SignUp**: Registration form with username, email, password, full name, and role selection
- **Login**: Login form with username and password
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during API calls

## Usage

### Registration
Users can register with:
- Username (required)
- Email (optional)
- Password (required)
- Full Name (optional)
- Role (optional): technician, staff, admin

### Login
Users can login with:
- Username
- Password

### Authentication Flow
1. User registers/logs in
2. JWT token is stored in localStorage
3. Token is automatically included in API requests
4. User session persists across browser refreshes
5. Automatic logout on token expiration

## API Integration

The service automatically handles:
- Request/response formatting
- Error handling
- Token management
- Loading states
- Authentication state

## Security Notes

- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- Client-side token validation is for UX only (backend validation is required)
- All sensitive operations should be validated on the backend
- Consider implementing refresh token mechanism for production use
