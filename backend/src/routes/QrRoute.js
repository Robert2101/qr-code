import express from 'express';
import { 
  saveQRCodes, 
  getUserQRCodes, 
  getAllQRCodes, 
  deleteQRCode, 
  validateUserQRCode,
  getUnclaimedQRCodes,
  claimQRCode,
  getQRCodeDetails,
  assignQRCode,
  assignQRCodeByValue,
  appendQRPath
} from '../controllers/QrController.js';

const QrRoute = express.Router();

// Save QR codes (admin)
QrRoute.post('/save', saveQRCodes);

// Get unclaimed QR codes for users to claim
QrRoute.get('/unclaimed', getUnclaimedQRCodes);

// Claim a QR code with purpose
QrRoute.post('/claim', claimQRCode);

// Get QR code details (for scanning)
QrRoute.get('/details/:qrValue', getQRCodeDetails);

// Get QR codes for a user
QrRoute.get('/user/:userId', getUserQRCodes);

// Get all QR codes (for all users)
QrRoute.get('/all', getAllQRCodes);

// Delete a QR code by ID
QrRoute.delete('/:id', deleteQRCode);

// Validate if a QR code belongs to a user
QrRoute.post('/validate', validateUserQRCode);

// Assign a QR code to a user by userId and QR value, and save lat/lng
QrRoute.post('/assign/:userId/:qrValue', assignQRCode);

// Assign a QR code by value, update user, lat, lng
QrRoute.post('/:qrValue', assignQRCodeByValue);

// Append a new location to the path array for a QR code by value
QrRoute.post('/:qrValue/path', appendQRPath);

export default QrRoute; 