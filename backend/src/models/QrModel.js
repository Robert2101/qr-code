import mongoose from 'mongoose';

const qrSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  purpose: {
    type: String,
    required: false,
  },
  isClaimed: {
    type: Boolean,
    default: false,
  },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  path: [
    {
      lat: { type: Number },
      lng: { type: Number },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const QR = mongoose.model('QR', qrSchema);
export default QR; 