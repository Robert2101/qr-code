import mongoose from "mongoose";
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
        required: true,
        unique: true,
        lowercase: true,
        trim: true
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

module.exports = mongoose.model('Recycler', recyclerSchema);