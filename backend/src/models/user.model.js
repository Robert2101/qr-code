import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false, // Email is now optional
        unique: true,
        // sparse index ensures uniqueness is only applied to documents with an email field.
        // This allows multiple users to register without an email address.
        sparse: true,
    },
    mobile: {
        type: String,
        required: true, // Mobile number is now required
        unique: true,   // Mobile number must be unique for login
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    },
    address: {
        street: String,
        city: String,
        state: String,
        pinCode: String,
    },
    qrCodeUrl: {
        type: String, // URL from Cloudinary
        default: ''
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String 
    },
    otpExpires: {
        type: Date
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;