# RapidRide Backend Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Running the Server](#running-the-server)
6. [Project Structure](#project-structure)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager
- **Git** (for version control)

### Recommended Tools
- **Postman** or **Insomnia** (for API testing)
- **MongoDB Compass** (GUI for MongoDB)
- **VS Code** (code editor)

---

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd RAPIDRIDE/backend
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `dotenv` - Environment variables
- `cors` - Cross-origin resource sharing
- `socket.io` - Real-time communication
- `nodemon` - Development server auto-restart

---

## Configuration

### 1. Create Environment File
Create a `.env` file in the `backend` directory:

```env
# Database Configuration
MONGO_URL=mongodb://localhost:27017/rapidride

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Configuration
PORT=5500
NODE_ENV=development

# Optional: MongoDB Atlas (Cloud)
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/rapidride?retryWrites=true&w=majority
```

### 2. Update package.json Scripts
Ensure your `package.json` has these scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "lint": "eslint ."
  }
}
```

---

## Database Setup

### Option 1: Local MongoDB

#### Start MongoDB Service
**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

#### Verify MongoDB is Running
```bash
mongosh
# or
mongo
```

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add your IP address to the whitelist (or use `0.0.0.0/0` for development)
4. Create a database user
5. Get your connection string and update `.env`:
   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/rapidride
   ```

### Database Initialization

The application will automatically create the necessary collections on first run. To seed initial data:

```bash
# Create a seed script (optional)
node scripts/seed.js
```

---

## Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Verify Server is Running
You should see:
```
Server running on http://localhost:5500
MongoDB connected successfully
Socket connected: <socket-id>
```

### Test the API
Open your browser and navigate to:
- `http://localhost:5500` - Should serve the login page
- `http://localhost:5500/api/profile` - Should return 401 (Unauthorized) without token

---

## Project Structure

```
backend/
├── app.js                  # Express app configuration
├── server.js              # Server entry point with Socket.IO
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (not in git)
├── config/
│   ├── db.js             # Database connection
│   └── jwt.js            # JWT configuration
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── riderController.js # Rider operations
│   └── driverController.js# Driver operations
├── middleware/
│   └── authMiddleware.js  # JWT verification
├── models/
│   ├── User.js           # User schema (riders & drivers)
│   └── Ride.js           # Ride schema
├── routes/
│   ├── authRoutes.js     # Auth endpoints
│   ├── riderRoutes.js    # Rider endpoints
│   └── driverRoutes.js   # Driver endpoints
└── services/
    └── authService.js     # Auth business logic
```

---

## Testing

### Manual Testing with Postman

#### 1. Sign Up
```http
POST http://localhost:5500/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "rider"
}
```

#### 2. Login
```http
POST http://localhost:5500/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

Copy the returned token.

#### 3. Test Protected Endpoint
```http
GET http://localhost:5500/api/profile
Authorization: Bearer <your_token_here>
```

### Testing Socket.IO

Create a test HTML file:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Socket.IO Test</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <h1>Socket.IO Test</h1>
  <div id="status">Connecting...</div>
  <script>
    const socket = io('http://localhost:5500');
    
    socket.on('connect', () => {
      document.getElementById('status').textContent = 'Connected: ' + socket.id;
      console.log('Socket connected:', socket.id);
    });
    
    socket.on('driver_location_update', (data) => {
      console.log('Driver location update:', data);
    });
  </script>
</body>
</html>
```

---

## Deployment

### Preparing for Production

#### 1. Environment Variables
Update `.env` for production:
```env
NODE_ENV=production
MONGO_URL=<production_mongodb_url>
JWT_SECRET=<strong_random_secret>
PORT=5500
```

#### 2. Security Checklist
- ✅ Use strong JWT secret
- ✅ Enable HTTPS
- ✅ Add rate limiting
- ✅ Implement input validation
- ✅ Use helmet for security headers
- ✅ Enable CORS only for your domain
- ✅ Hash all passwords (already done with bcrypt)
- ✅ Sanitize user inputs
- ✅ Add request logging

#### 3. Install Production Dependencies
```bash
npm install helmet express-rate-limit express-validator
```

#### 4. Update app.js
```javascript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Add security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS for production
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### Deployment Platforms

#### Option 1: Heroku
```bash
# Install Heroku CLI
# heroku login
heroku create rapidride-api
heroku config:set MONGO_URL=<your_mongodb_url>
heroku config:set JWT_SECRET=<your_jwt_secret>
git push heroku main
```

#### Option 2: DigitalOcean/AWS/Azure
1. Set up a Linux server (Ubuntu 20.04+)
2. Install Node.js and MongoDB
3. Clone your repository
4. Install PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name rapidride-api
   pm2 startup
   pm2 save
   ```
5. Set up Nginx as reverse proxy
6. Configure SSL with Let's Encrypt

#### Option 3: Railway/Render
- Connect your GitHub repository
- Set environment variables in dashboard
- Deploy automatically on git push

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
- Check if MongoDB is running: `sudo systemctl status mongod`
- Verify connection string in `.env`
- Check firewall settings
- For MongoDB Atlas, verify IP whitelist

#### 2. Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5500`

**Solution:**
```bash
# Find process using port 5500
# Windows:
netstat -ano | findstr :5500
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5500
kill -9 <PID>

# Or change PORT in .env
```

#### 3. JWT Token Invalid
**Error:** `JsonWebTokenError: invalid token`

**Solution:**
- Ensure token is sent in Authorization header
- Check token format: `Bearer <token>`
- Verify JWT_SECRET matches the one used to create token
- Token might be expired (default: 7 days)

#### 4. CORS Issues
**Error:** `Access to fetch blocked by CORS policy`

**Solution:**
```javascript
// In app.js, update CORS config
app.use(cors({
  origin: '*', // or specific domain
  credentials: true
}));
```

#### 5. Module Not Found
**Error:** `Cannot find module 'express'`

**Solution:**
```bash
npm install
# or
rm -rf node_modules package-lock.json
npm install
```

### Enable Debug Logging

Add to `.env`:
```env
DEBUG=express:*
```

Or add console logs in code:
```javascript
console.log('Request body:', req.body);
console.log('User ID:', req.user.id);
```

### Database Issues

Check MongoDB logs:
```bash
# Linux/macOS
sudo tail -f /var/log/mongodb/mongod.log

# Windows
# Check: C:\Program Files\MongoDB\Server\<version>\log\mongod.log
```

---

## API Documentation

For complete API documentation, see: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

Key endpoints:
- **Auth:** `/auth/signup`, `/auth/login`
- **Rider:** `/api/profile`, `/api/rides`, `/api/analytics`
- **Driver:** `/api/driver/profile`, `/api/driver/rides`, `/api/driver/earnings`

---

## Development Workflow

### 1. Create a New Feature
```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

### 2. Test Your Changes
- Run the server: `npm run dev`
- Test endpoints with Postman
- Check console for errors

### 3. Code Review & Merge
- Create a pull request
- Get code review
- Merge to main branch

---

## Performance Optimization

### 1. Database Indexing
Already implemented:
- Geospatial index on `User.currentLocation`
- Add more as needed:
  ```javascript
  RideSchema.index({ riderId: 1, status: 1 });
  RideSchema.index({ driverId: 1, completedAt: -1 });
  ```

### 2. Caching
Consider adding Redis for:
- Session management
- Real-time data caching
- Rate limiting

### 3. Query Optimization
- Use `.lean()` for read-only queries
- Use `.select()` to limit fields
- Implement pagination

---

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use strong passwords** - Minimum 8 characters, mixed case, numbers, symbols
3. **Validate all inputs** - Use express-validator
4. **Sanitize data** - Prevent NoSQL injection
5. **Rate limit APIs** - Prevent abuse
6. **Use HTTPS** - Always in production
7. **Keep dependencies updated** - Run `npm audit` regularly
8. **Implement logging** - Track security events
9. **Use environment-specific configs** - Different settings for dev/prod
10. **Regular backups** - Backup MongoDB regularly

---

## Monitoring & Logging

### Production Monitoring Tools
- **PM2** - Process management and monitoring
- **New Relic** - Application performance monitoring
- **Sentry** - Error tracking
- **LogRocket** - Session replay and logging

### Setup PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Next Steps

1. ✅ Backend API implemented
2. ✅ Socket.IO for real-time updates
3. ✅ Driver dashboard created
4. 🔲 Add input validation
5. 🔲 Implement payment gateway
6. 🔲 Add automated tests
7. 🔲 Set up CI/CD pipeline
8. 🔲 Deploy to production
9. 🔲 Add monitoring and logging
10. 🔲 Implement advanced features (ride pooling, scheduled rides, etc.)

---

## Support & Resources

- **MongoDB Docs:** https://docs.mongodb.com/
- **Express Docs:** https://expressjs.com/
- **Socket.IO Docs:** https://socket.io/docs/
- **JWT Docs:** https://jwt.io/
- **Node.js Best Practices:** https://github.com/goldbergyoni/nodebestpractices

---

*Happy Coding! 🚀*
