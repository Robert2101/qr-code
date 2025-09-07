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
    required: true,
    unique: true
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
<<<<<<< HEAD
    default: null
=======
    default: ""
>>>>>>> c81b36c7c0fb29733e30c3d4a9ebe4328a1c4683
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
