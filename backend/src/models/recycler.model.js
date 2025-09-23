import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const recyclerSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
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
        default: 'recycler'
    },
    location: {
        address: String,
        city: String,
        state: String,
        zipCode: String
    }
}, { timestamps: true });

const Recycler = mongoose.model('Recycler', recyclerSchema);
export default Recycler;