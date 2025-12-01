# 🚀 RapidRide Backend

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file with:
```env
MONGO_URL=mongodb://127.0.0.1:27017/rapidride
JWT_SECRET=super_secret_key_for_rapidride
JWT_EXPIRES=1d
PORT=5500
```

### 3. Start MongoDB
**Windows:**
```powershell
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

### 4. Run Server
```bash
npm start
```

### 5. Access Application
Open browser: `http://localhost:5500`

---

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js           # MongoDB connection
│   └── jwt.js          # JWT configuration
├── controllers/
│   ├── authController.js
│   ├── riderController.js
│   └── driverController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── User.js         # User schema
│   └── Ride.js         # Ride schema
├── routes/
│   ├── authRoutes.js
│   ├── riderRoutes.js
│   └── driverRoutes.js
├── services/
│   └── authService.js
├── .env                # Environment variables
├── .env.example        # Template
├── app.js              # Express app
├── server.js           # Entry point
└── package.json
```

---

## 🔌 API Endpoints

### Authentication (`/auth`)
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (requires token)

### Rider (`/rider`)
- `GET /rider/profile` - Get rider profile
- `PUT /rider/profile` - Update profile
- `POST /rider/rides` - Book new ride
- `GET /rider/rides` - Get all rides
- `POST /rider/rides/:id/cancel` - Cancel ride
- `POST /rider/rides/:id/rate` - Rate driver
- `GET /rider/analytics` - Get analytics
- `GET /rider/notifications` - Get notifications

### Driver (`/driver`)
- `GET /driver/profile` - Get driver profile
- `PUT /driver/profile` - Update profile
- `PUT /driver/status` - Toggle online/offline
- `GET /driver/rides` - Get assigned rides
- `POST /driver/rides/:id/accept` - Accept ride
- `POST /driver/rides/:id/complete` - Complete ride
- `GET /driver/earnings` - Get earnings
- `GET /driver/analytics` - Get performance stats

---

## 🔧 Scripts

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

---

## 🛠️ Tech Stack

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Socket.IO** - Real-time communication
- **dotenv** - Environment variables

---

## ❌ Troubleshooting

### "Cannot GET /"
- Ensure server is running
- Check terminal for "Server running on http://localhost:5500"
- Visit the troubleshooting guide: `../TROUBLESHOOTING.md`

### "connect ECONNREFUSED 127.0.0.1:27017"
- MongoDB is not running
- Start MongoDB: `net start MongoDB` (Windows) or `sudo systemctl start mongod` (Linux/macOS)

### "Port 5500 is already in use"
- Another app is using port 5500
- Kill process or change PORT in `.env`

---

## 📚 Documentation

- [Main README](../README.md)
- [Troubleshooting Guide](../TROUBLESHOOTING.md)
- [API Documentation](./API_DOCUMENTATION.md) *(if exists)*

---

## 🔐 Security Notes

- Never commit `.env` file to git
- Use strong JWT_SECRET in production
- Enable CORS only for trusted origins in production
- Use HTTPS in production
- Implement rate limiting
- Validate all inputs

---

**Ready to go!** Run `npm start` and open `http://localhost:5500` 🚀
