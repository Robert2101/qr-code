import mongoose from "mongoose";

const Schema = mongoose.Schema;

const transporterSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: false, // Email is now optional
    unique: true,
    sparse: true // Ensures unique constraint only applies to documents with an email
  },
  mobile: {
    type: String,
    required: true, // Mobile number is now required
    unique: true   // Mobile number must be unique for login
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "transporter"
  },
  vehicleInfo: {
    model: String,
    licensePlate: {
      type: String,
      unique: true,
      required: true
    }
  },
  qrCodeUrl: {
    type: String, // URL from Cloudinary
    default: null
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  currentLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  }
}, { timestamps: true });

// Create a geospatial 2dsphere index
transporterSchema.index({ currentLocation: "2dsphere" });

const Transporter = mongoose.model("Transporter", transporterSchema);

export default Transporter;