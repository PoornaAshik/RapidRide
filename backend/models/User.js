import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "rider" }, // rider, driver, admin
  phone: String,
  avatar: String,
  rating: { type: Number, default: 0 },
  totalRides: { type: Number, default: 0 },
  
  // Driver-specific fields
  onlineStatus: { type: Boolean, default: false },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  vehicleInfo: {
    type: {
      type: String,
      default: 'Sedan'
    },
    model: String,
    plateNumber: String,
    color: String
  },
  documents: {
    license: {
      verified: { type: Boolean, default: false },
      expiry: Date
    },
    insurance: {
      verified: { type: Boolean, default: false },
      expiry: Date
    },
    registration: {
      verified: { type: Boolean, default: false },
      expiry: Date
    }
  }
}, {
  timestamps: true
});

// Create geospatial index for location queries
UserSchema.index({ currentLocation: '2dsphere' });

export default mongoose.model("User", UserSchema);
