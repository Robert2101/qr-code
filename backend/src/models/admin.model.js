import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false // Prevents the password hash from being sent in queries by default
    },
    role: {
        type: String,
        default: 'admin' // Role is now fixed to 'admin'
    },
    isActive: {
        type: Boolean,
        default: true // Allows you to deactivate an admin account without deleting it
    },
    lastLogin: {
        type: Date
    }
}, { 
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;