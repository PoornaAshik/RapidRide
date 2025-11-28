# RapidRide API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Rider Endpoints](#rider-endpoints)
3. [Driver Endpoints](#driver-endpoints)
4. [Real-time Socket.IO Events](#real-time-socketio-events)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)

---

## Base URL
- Development: `http://localhost:5500`
- Production: Update as needed

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Sign Up
- **POST** `/auth/signup`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "rider" // or "driver"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "token": "jwt_token_here"
  }
  ```

### Login
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "rider"
    }
  }
  ```

---

## Rider Endpoints

All rider endpoints are prefixed with `/api` and require authentication.

### Profile Management

#### Get Profile
- **GET** `/api/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "avatar": "url_to_avatar",
      "rating": 4.8,
      "totalRides": 45
    }
  }
  ```

#### Update Profile
- **PUT** `/api/profile`
- **Body:**
  ```json
  {
    "name": "John Smith",
    "phone": "+1234567890",
    "avatar": "new_avatar_url"
  }
  ```

### Ride Management

#### Get All Rides
- **GET** `/api/rides?status=all&limit=20&page=1`
- **Query Parameters:**
  - `status`: all, searching, assigned, in_progress, completed, cancelled
  - `limit`: Number of rides per page (default: 20)
  - `page`: Page number (default: 1)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "rides": [...],
      "total": 100,
      "page": 1,
      "pages": 5
    }
  }
  ```

#### Book a Ride
- **POST** `/api/rides`
- **Body:**
  ```json
  {
    "pickup": {
      "latitude": 12.9716,
      "longitude": 77.5946,
      "address": "MG Road, Bangalore"
    },
    "dropoff": {
      "latitude": 12.2958,
      "longitude": 76.6394,
      "address": "Mysore Palace"
    },
    "vehicleType": "Sedan",
    "paymentMethod": "card"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "rideId": "ride_id",
      "status": "searching",
      "estimatedFare": 450,
      "estimatedTime": "15 mins"
    }
  }
  ```

#### Cancel Ride
- **POST** `/api/rides/:rideId/cancel`
- **Body:**
  ```json
  {
    "reason": "Changed my mind"
  }
  ```

#### Rate Ride
- **POST** `/api/rides/:rideId/rate`
- **Body:**
  ```json
  {
    "rating": 5,
    "feedback": "Great ride!"
  }
  ```

### Analytics

#### Get Ride Analytics
- **GET** `/api/analytics?period=week`
- **Query Parameters:**
  - `period`: day, week, month
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "totalRides": 12,
        "totalSpent": 5400,
        "avgFarePerRide": 450,
        "totalDistance": 180
      },
      "chart": {
        "labels": ["2025-11-20", "2025-11-21", ...],
        "data": [3, 5, 2, ...]
      }
    }
  }
  ```

### Notifications

#### Get Notifications
- **GET** `/api/notifications`
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "type": "ride_update",
        "title": "Driver Assigned",
        "message": "Your driver is on the way",
        "read": false,
        "createdAt": "2025-11-24T10:30:00Z"
      }
    ]
  }
  ```

#### Mark Notification as Read
- **PUT** `/api/notifications/:id/read`

### Payment Methods

#### Get Payment Methods
- **GET** `/api/payment-methods`

#### Add Payment Method
- **POST** `/api/payment-methods`
- **Body:**
  ```json
  {
    "type": "card",
    "last4": "4242",
    "brand": "Visa",
    "expMonth": 12,
    "expYear": 2026
  }
  ```

#### Delete Payment Method
- **DELETE** `/api/payment-methods/:id`

### Support & Emergency

#### Contact Support
- **POST** `/api/support`
- **Body:**
  ```json
  {
    "subject": "Issue with ride",
    "message": "I was charged incorrectly",
    "category": "billing"
  }
  ```

#### Trigger Emergency SOS
- **POST** `/api/emergency`
- **Body:**
  ```json
  {
    "location": {
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "rideId": "current_ride_id"
  }
  ```

---

## Driver Endpoints

All driver endpoints are prefixed with `/api/driver` and require authentication with a driver role.

### Profile Management

#### Get Driver Profile
- **GET** `/api/driver/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "driver_id",
      "name": "Jane Driver",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "avatar": "url",
      "rating": 4.7,
      "totalRides": 450,
      "vehicleInfo": {
        "type": "Sedan",
        "model": "Toyota Innova",
        "plateNumber": "KA-01-AB-1234",
        "color": "White"
      },
      "documents": {
        "license": { "verified": true, "expiry": "2026-12-31" },
        "insurance": { "verified": true, "expiry": "2025-12-31" },
        "registration": { "verified": true, "expiry": "2027-06-30" }
      },
      "onlineStatus": true
    }
  }
  ```

#### Update Driver Profile
- **PUT** `/api/driver/profile`
- **Body:**
  ```json
  {
    "name": "Jane Smith",
    "phone": "+1234567890",
    "vehicleInfo": {
      "model": "Toyota Camry",
      "color": "Black"
    }
  }
  ```

### Status & Location

#### Update Online Status
- **POST** `/api/driver/status`
- **Body:**
  ```json
  {
    "status": true // true = online, false = offline
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Driver is now online",
    "data": { "onlineStatus": true }
  }
  ```

#### Update Location (Real-time)
- **POST** `/api/driver/location`
- **Body:**
  ```json
  {
    "latitude": 12.9716,
    "longitude": 77.5946
  }
  ```
- **Note:** This also emits a Socket.IO event `driver_location_update`

### Ride Management

#### Get Driver Rides
- **GET** `/api/driver/rides?status=all&limit=20&page=1`
- **Query Parameters:**
  - `status`: all, assigned, in_progress, completed, cancelled
  - `limit`: Number of rides per page
  - `page`: Page number

#### Accept Ride Request
- **POST** `/api/driver/rides/:rideId/accept`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Ride accepted",
    "data": {
      "rideId": "ride_id",
      "status": "assigned",
      "pickup": {...},
      "dropoff": {...},
      "rider": {
        "name": "John Doe",
        "phone": "+1234567890",
        "rating": 4.8
      }
    }
  }
  ```

#### Start Ride
- **POST** `/api/driver/rides/:rideId/start`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Ride started"
  }
  ```

#### Complete Ride
- **POST** `/api/driver/rides/:rideId/complete`
- **Body:**
  ```json
  {
    "finalFare": 450,
    "distance": 15.5,
    "duration": 30 // minutes
  }
  ```

#### Cancel Ride
- **POST** `/api/driver/rides/:rideId/cancel`
- **Body:**
  ```json
  {
    "reason": "Vehicle breakdown"
  }
  ```

### Earnings

#### Get Earnings
- **GET** `/api/driver/earnings?period=today`
- **Query Parameters:**
  - `period`: today, week, month, all
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "period": "today",
      "totalEarnings": "1500.00",
      "commission": "300.00",
      "netEarnings": "1200.00",
      "totalRides": 12,
      "averagePerRide": "125.00",
      "breakdown": [...]
    }
  }
  ```

### Incentives

#### Get Incentives
- **GET** `/api/driver/incentives`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "active": [
        {
          "id": 1,
          "title": "Complete 50 rides",
          "description": "Earn ₹2000 bonus",
          "progress": 35,
          "target": 50,
          "reward": 2000,
          "expiresAt": "2025-12-31"
        }
      ],
      "completed": [...],
      "totalEarned": 5000
    }
  }
  ```

### Analytics

#### Get Driver Analytics
- **GET** `/api/driver/analytics?period=week`
- **Query Parameters:**
  - `period`: day, week, month
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "totalRides": 85,
        "totalEarnings": "12500.00",
        "totalDistance": "850.5",
        "avgRating": "4.7"
      },
      "chart": {
        "labels": ["2025-11-18", "2025-11-19", ...],
        "data": [12, 15, 10, ...]
      }
    }
  }
  ```

### Notifications

#### Get Driver Notifications
- **GET** `/api/driver/notifications`

### Support & Emergency

#### Contact Support
- **POST** `/api/driver/support`
- **Body:**
  ```json
  {
    "subject": "Payment issue",
    "message": "Missing payment from yesterday",
    "issueType": "payment"
  }
  ```

#### Trigger Emergency SOS
- **POST** `/api/driver/sos`
- **Body:**
  ```json
  {
    "location": {
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "reason": "Accident"
  }
  ```

---

## Real-time Socket.IO Events

### Connection
```javascript
const socket = io('http://localhost:5500');
```

### Events Emitted by Server

#### `driver_location_update`
- Sent when a driver's location is updated
- **Data:**
  ```json
  {
    "driverId": "driver_id",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "timestamp": "2025-11-24T10:30:00Z"
  }
  ```

#### `ride_assigned`
- Sent when a ride is assigned to a driver
- **Data:**
  ```json
  {
    "rideId": "ride_id",
    "driverId": "driver_id",
    "riderId": "rider_id"
  }
  ```

#### `ride_started`
- Sent when a ride starts
- **Data:**
  ```json
  {
    "rideId": "ride_id",
    "riderId": "rider_id"
  }
  ```

#### `ride_completed`
- Sent when a ride is completed
- **Data:**
  ```json
  {
    "rideId": "ride_id",
    "riderId": "rider_id",
    "fare": 450
  }
  ```

#### `ride_cancelled`
- Sent when a ride is cancelled
- **Data:**
  ```json
  {
    "rideId": "ride_id",
    "riderId": "rider_id",
    "cancelledBy": "driver" // or "rider"
  }
  ```

#### `driver_status_change`
- Sent when a driver goes online/offline
- **Data:**
  ```json
  {
    "driverId": "driver_id",
    "status": true // true = online, false = offline
  }
  ```

#### `driver_sos`
- Sent when a driver triggers emergency SOS
- **Data:**
  ```json
  {
    "driverId": "driver_id",
    "location": {...},
    "reason": "Accident",
    "timestamp": "2025-11-24T10:30:00Z"
  }
  ```

### Events Emitted by Client

#### `subscribe_ride`
- Subscribe to updates for a specific ride
- **Data:**
  ```json
  {
    "rideId": "ride_id"
  }
  ```

#### `unsubscribe_ride`
- Unsubscribe from ride updates
- **Data:**
  ```json
  {
    "rideId": "ride_id"
  }
  ```

#### `driver:updateLocation`
- Driver client emits location updates
- **Data:**
  ```json
  {
    "rideId": "ride_id",
    "lng": 77.5946,
    "lat": 12.9716
  }
  ```

---

## Data Models

### User (Rider/Driver)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String, // 'rider', 'driver', 'admin'
  phone: String,
  avatar: String,
  rating: Number,
  totalRides: Number,
  
  // Driver-specific
  onlineStatus: Boolean,
  currentLocation: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  vehicleInfo: {
    type: String,
    model: String,
    plateNumber: String,
    color: String
  },
  documents: {
    license: { verified: Boolean, expiry: Date },
    insurance: { verified: Boolean, expiry: Date },
    registration: { verified: Boolean, expiry: Date }
  },
  
  timestamps: true
}
```

### Ride
```javascript
{
  _id: ObjectId,
  riderId: ObjectId (ref: User),
  driverId: ObjectId (ref: User),
  pickup: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  dropoff: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  status: String, // 'searching', 'assigned', 'in_progress', 'completed', 'cancelled'
  vehicleType: String,
  estimatedFare: Number,
  fare: Number,
  distance: Number,
  duration: Number,
  paymentMethod: String,
  rating: Number,
  feedback: String,
  cancelledBy: String,
  cancellationReason: String,
  
  // Timestamps
  createdAt: Date,
  assignedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date
}
```

---

## Error Handling

All API endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (optional)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Example Error Responses

#### 401 Unauthorized
```json
{
  "message": "No token provided"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Ride not found"
}
```

#### 500 Server Error
```json
{
  "success": false,
  "message": "Server error",
  "error": "Detailed error message"
}
```

---

## Development Notes

### Environment Variables
Create a `.env` file in the backend directory:
```env
MONGO_URL=mongodb://localhost:27017/rapidride
JWT_SECRET=your_jwt_secret_key_here
PORT=5500
```

### Running the Server
```bash
cd backend
npm install
npm start
```

### Testing Endpoints
Use Postman or any API testing tool:
1. Sign up or log in to get a JWT token
2. Add the token to the Authorization header
3. Test endpoints as documented

### Database Indexes
The User model has a geospatial index on `currentLocation` for efficient location-based queries:
```javascript
UserSchema.index({ currentLocation: '2dsphere' });
```

### Next Steps for Backend Team
1. ✅ Implement driver controller logic
2. ✅ Add Socket.IO integration for real-time updates
3. 🔲 Add input validation using express-validator
4. 🔲 Implement rate limiting to prevent abuse
5. 🔲 Add comprehensive error logging
6. 🔲 Create notification model and persistence
7. 🔲 Implement payment gateway integration (Stripe/Razorpay)
8. 🔲 Add unit and integration tests
9. 🔲 Set up CI/CD pipeline
10. 🔲 Add API documentation using Swagger/OpenAPI

---

## Frontend Integration

### Setting up API Client (example in React)
```javascript
// api.js
const API_BASE_URL = window.location.origin;

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    return response.json();
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};
```

### Setting up Socket.IO Client
```javascript
// socket.js
import { io } from 'socket.io-client';

const socket = io(window.location.origin);

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('driver_location_update', (data) => {
  console.log('Driver location:', data);
  // Update map marker
});

export default socket;
```

---

*Last Updated: November 24, 2025*
