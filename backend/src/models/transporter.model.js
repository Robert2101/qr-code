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
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'transporter'
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
        default: ''
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] },
        index: "2dsphere" // [longitude, latitude]
    }
}, { timestamps: true });

// Create a geospatial index for efficient location queries
transporterSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Transporter', transporterSchema);