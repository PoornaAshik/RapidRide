# 🚗 RapidRide - Full-Stack Ride Booking Application

A modern, professional ride-booking platform with real-time tracking, separate dashboards for riders and drivers, and comprehensive backend APIs.

![RapidRide Logo](frontend/rapidride_logo.png)

## 📋 Table of Contents
- [✨ Getting Started](#-getting-started---download--run)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Screenshots](#screenshots)
- [API Endpoints](#api-endpoints)
- [Real-time Features](#real-time-features)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Getting Started - Download & Run

**👉 Want to run RapidRide on your computer?**

### 📥 [Complete Download & Setup Guide](DOWNLOAD_AND_SETUP.md)
**Perfect for beginners!** Step-by-step instructions to:
- Download the project (with or without Git)
- Install dependencies
- Configure the database
- Run the application
- Create your first account

### 🌐 [Deployment Guide](DEPLOYMENT_GUIDE.md)
**Ready for production?** Deploy to:
- Render (Free & Easy)
- Heroku
- Railway
- DigitalOcean
- With MongoDB Atlas (Cloud Database)

---

## ✨ Features

### For Riders
- 🗺️ **Real-time Map** - Interactive map with OpenStreetMap (Leaflet)
- 🚕 **Book Rides** - Easy ride booking with pickup/dropoff selection
- 📍 **Live Tracking** - Track driver location in real-time
- 💳 **Multiple Payment Methods** - Card, wallet, cash support
- ⭐ **Rate & Review** - Rate drivers after each ride
- 📊 **Analytics** - View ride history and spending patterns
- 🎁 **Coupons & Offers** - Apply promo codes for discounts
- 🆘 **Emergency SOS** - Quick emergency alert system
- 💬 **24/7 Support** - In-app customer support

### For Drivers
- 🟢 **Online/Offline Toggle** - Control availability with one click
- 📱 **Ride Requests** - Receive and accept ride requests
- 🗺️ **Navigation** - Integrated route navigation
- 💰 **Earnings Dashboard** - Track daily/weekly/monthly earnings
- 🎯 **Incentives** - View active and completed incentive programs
- 📊 **Performance Analytics** - Detailed stats and charts
- 🚨 **Emergency SOS** - Quick emergency alert button
- 📍 **Location Tracking** - Automatic location updates to riders
- 💬 **Support System** - Contact support for any issues

### For Platform
- 🔐 **JWT Authentication** - Secure token-based auth
- 🔄 **Real-time Updates** - Socket.IO for live data
- 🗃️ **MongoDB Database** - Scalable NoSQL storage
- 📱 **Responsive Design** - Works on all devices
- 🌐 **RESTful APIs** - Clean, well-documented APIs
- 🔒 **Secure** - Password hashing, input validation

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients, animations
- **JavaScript (ES6+)** - Vanilla JS for better performance
- **Leaflet.js** - Interactive maps (OpenStreetMap)
- **Chart.js** - Beautiful charts and graphs
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for auth
- **bcryptjs** - Password hashing
- **Socket.IO** - Real-time bidirectional communication
- **dotenv** - Environment variable management

---

## 📁 Project Structure

```
RAPIDRIDE/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── jwt.js                # JWT configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── riderController.js    # Rider operations
│   │   └── driverController.js   # Driver operations
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── models/
│   │   ├── User.js               # User schema (riders & drivers)
│   │   └── Ride.js               # Ride schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── riderRoutes.js        # Rider endpoints
│   │   └── driverRoutes.js       # Driver endpoints
│   ├── services/
│   │   └── authService.js        # Auth business logic
│   ├── app.js                    # Express app config
│   ├── server.js                 # Server entry point
│   ├── package.json              # Dependencies
│   ├── .env                      # Environment variables
│   ├── API_DOCUMENTATION.md      # Complete API docs
│   └── SETUP_GUIDE.md            # Backend setup guide
│
├── frontend/
│   ├── login.html                # Login page
│   ├── login.css                 # Login styles
│   ├── login.js                  # Login logic
│   ├── signup.html               # Signup page
│   ├── signup.css                # Signup styles
│   ├── signup.js                 # Signup logic
│   ├── rapidride_logo.png        # App logo
│   │
│   ├── rider/                    # Rider dashboard
│   │   ├── pages/
│   │   │   └── dashboard.html    # Rider dashboard UI
│   │   └── assets/
│   │       ├── css/
│   │       │   └── dashboard.css # Rider styles
│   │       └── js/
│   │           ├── dashboard.js  # Rider controller
│   │           ├── api.js        # API client
│   │           ├── socket.js     # Socket client
│   │           ├── ride.js       # Ride management
│   │           └── notifications.js # Notifications
│   │
│   └── driver/                   # Driver dashboard
│       ├── pages/
│       │   └── dashboard.html    # Driver dashboard UI
│       └── assets/
│           ├── css/
│           │   └── dashboard.css # Driver styles
│           └── js/
│               ├── dashboard.js  # Driver controller
│               ├── api.js        # Driver API client
│               └── socket.js     # Driver socket client
│
└── README.md                     # This file
```

---

## 🚀 Quick Start

> **📥 New User? Start Here!**  
> **Complete Download & Setup Guide:** [`DOWNLOAD_AND_SETUP.md`](DOWNLOAD_AND_SETUP.md)  
> This step-by-step guide shows you exactly how to download and run RapidRide on your computer!

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RAPIDRIDE
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   MONGO_URL=mongodb://localhost:27017/rapidride
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   PORT=5500
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

5. **Run the backend server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open browser: `http://localhost:5500`
   - Login page will be served at root
   - Create an account or use test credentials

### Test Accounts

Create test accounts via signup or use these default credentials:

**Rider:**
- Email: `rider@test.com`
- Password: `password123`

**Driver:**
- Email: `driver@test.com`
- Password: `password123`

---

## 📚 Documentation

### 🎯 For New Users
- **[📥 Download & Setup Guide](DOWNLOAD_AND_SETUP.md)** - Complete beginner-friendly setup instructions
- **[🚀 Quick Start for GitHub](QUICK_START_GITHUB.md)** - Fast setup for developers
- **[🌐 Deployment Guide](DEPLOYMENT_GUIDE.md)** - Deploy to production (Render, Heroku, Railway)

### 🔧 For Developers
- **[📡 API Documentation](backend/API_DOCUMENTATION.md)** - Complete API reference with examples
- **[⚙️ Backend Setup Guide](backend/SETUP_GUIDE.md)** - Detailed backend configuration
- **[✅ Implementation Checklist](backend/IMPLEMENTATION_CHECKLIST.md)** - Development progress tracker

### 🤝 For Contributors
- **[🤝 Contributing Guide](CONTRIBUTING.md)** - How to contribute to RapidRide
- **[📤 GitHub Push Guide](GITHUB_PUSH_GUIDE.md)** - Git workflow for team members

### Quick Links
- [Authentication](#authentication)
- [Rider API Endpoints](#rider-endpoints)
- [Driver API Endpoints](#driver-endpoints)
- [Socket.IO Events](#real-time-events)

---

## 📸 Screenshots

### Login Page
Modern, responsive login interface with role-based authentication.

### Rider Dashboard
- Live map with driver tracking
- Ride history and analytics
- Payment management
- Notification center

### Driver Dashboard
- Real-time ride requests
- Earnings and incentives tracker
- Performance analytics
- Online/offline toggle

---

## 🔌 API Endpoints

### Authentication
```
POST /auth/signup    - Register new user
POST /auth/login     - Login user
```

### Rider Endpoints (Prefix: `/api`)
```
GET    /api/profile                    - Get rider profile
PUT    /api/profile                    - Update profile
GET    /api/rides                      - Get all rides
POST   /api/rides                      - Book new ride
POST   /api/rides/:id/cancel           - Cancel ride
POST   /api/rides/:id/rate             - Rate ride
GET    /api/analytics                  - Get analytics
GET    /api/notifications              - Get notifications
POST   /api/support                    - Contact support
POST   /api/emergency                  - Trigger SOS
```

### Driver Endpoints (Prefix: `/api/driver`)
```
GET    /api/driver/profile             - Get driver profile
PUT    /api/driver/profile             - Update profile
POST   /api/driver/status              - Update online/offline status
POST   /api/driver/location            - Update location
GET    /api/driver/rides               - Get driver rides
POST   /api/driver/rides/:id/accept    - Accept ride
POST   /api/driver/rides/:id/start     - Start ride
POST   /api/driver/rides/:id/complete  - Complete ride
POST   /api/driver/rides/:id/cancel    - Cancel ride
GET    /api/driver/earnings            - Get earnings
GET    /api/driver/incentives          - Get incentives
GET    /api/driver/analytics           - Get analytics
POST   /api/driver/support             - Contact support
POST   /api/driver/sos                 - Trigger emergency SOS
```

For complete API documentation with request/response examples, see [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md).

---

## 🔄 Real-time Features

### Socket.IO Events

**Server → Client:**
- `driver_location_update` - Driver location changes
- `ride_assigned` - Ride assigned to driver
- `ride_started` - Ride started
- `ride_completed` - Ride completed
- `ride_cancelled` - Ride cancelled
- `driver_status_change` - Driver goes online/offline
- `driver_sos` - Emergency alert from driver

**Client → Server:**
- `subscribe_ride` - Subscribe to ride updates
- `unsubscribe_ride` - Unsubscribe from ride
- `driver:updateLocation` - Driver sends location update

Example usage:
```javascript
const socket = io('http://localhost:5500');

socket.on('driver_location_update', (data) => {
  console.log('Driver location:', data);
  // Update map marker
});

socket.emit('subscribe_ride', { rideId: '12345' });
```

---

## 🌐 Deployment

### Heroku Deployment

1. **Install Heroku CLI**
2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku app**
   ```bash
   cd backend
   heroku create rapidride-api
   ```

4. **Set environment variables**
   ```bash
   heroku config:set MONGO_URL=<your_mongodb_url>
   heroku config:set JWT_SECRET=<your_jwt_secret>
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### Other Platforms
- **Railway** - Connect GitHub repo, set env vars, deploy
- **Render** - Connect GitHub, configure build settings
- **DigitalOcean** - Use App Platform or Droplet with PM2
- **AWS** - Deploy to EC2 or Elastic Beanstalk
- **Azure** - Use Azure App Service

See [SETUP_GUIDE.md](backend/SETUP_GUIDE.md) for detailed deployment instructions.

---

## 🧪 Testing

### Manual Testing
Use Postman to test API endpoints:
1. Import collection from `backend/postman_collection.json` (if available)
2. Sign up and get JWT token
3. Add token to Authorization header
4. Test endpoints

### Automated Testing (Coming Soon)
```bash
npm test
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Leaflet** - Free open-source map library
- **OpenStreetMap** - Free map data
- **Chart.js** - Beautiful charts
- **Socket.IO** - Real-time communication
- **MongoDB** - Flexible database
- **Express** - Fast web framework

---

## 📧 Contact

For questions or support, please contact:
- **Email:** support@rapidride.com
- **GitHub Issues:** [Create an issue](https://github.com/your-repo/rapidride/issues)

---

## 🗺️ Roadmap

- [x] User authentication (riders & drivers)
- [x] Rider dashboard with live map
- [x] Driver dashboard with earnings tracker
- [x] Real-time location tracking
- [x] Socket.IO integration
- [x] Complete backend APIs
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] SMS/Email notifications
- [ ] Push notifications (PWA)
- [ ] Ride pooling/sharing
- [ ] Scheduled rides
- [ ] Multi-language support
- [ ] Admin dashboard
- [ ] Mobile apps (React Native)
- [ ] Advanced analytics with ML
- [ ] Voice commands
- [ ] In-app chat between rider and driver

---

**Built with ❤️ by the RapidRide Team**

*Last Updated: November 24, 2025*
