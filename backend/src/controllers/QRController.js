import QR from '../models/QrModel.js';
import User from '../models/userModel.js';


export const saveQRCodes = async (req, res) => {
  try {
    const { qrCodes } = req.body;
    if (!qrCodes || !Array.isArray(qrCodes) || qrCodes.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid data' });
    }
    const qrDocs = qrCodes.map((qr) => ({
      value: qr.value,
      timestamp: qr.timestamp || Date.now(),
      isClaimed: false,
    }));
    const savedQRCodes = await QR.insertMany(qrDocs);
    res.status(201).json({ success: true, qrCodes: savedQRCodes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to save QR codes' });
  }
};


export const getUnclaimedQRCodes = async (req, res) => {
  try {
    const qrCodes = await QR.find({ isClaimed: false }).sort({ timestamp: -1 });
    res.status(200).json({ success: true, qrCodes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch unclaimed QR codes' });
  }
};

export const claimQRCode = async (req, res) => {
  try {
    const { qrId, purpose, userId, location } = req.body;
    if (!qrId || !purpose || !userId) {
      return res.status(400).json({ success: false, message: 'QR ID, purpose, and user ID are required' });
    }
    
    // Check if QR code is already claimed
    const qrCode = await QR.findById(qrId);
    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }
    if (qrCode.isClaimed) {
      return res.status(400).json({ success: false, message: 'QR code is already claimed' });
    }
    
    // Claim the QR code
    const updateData = {
      user: userId,
      purpose: purpose,
      isClaimed: true
    };
    if (location && location.lat && location.lng) {
      updateData.location = location;
    }
    const updatedQR = await QR.findByIdAndUpdate(qrId, updateData, { new: true }).populate('user', 'name email');
    
    res.status(200).json({ success: true, qrCode: updatedQR });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to claim QR code' });
  }
};

// Get QR code details (for scanning)
export const getQRCodeDetails = async (req, res) => {
  try {
    const { qrValue } = req.params;
    const qrCode = await QR.findOne({ value: qrValue }).populate('user', 'name email');
    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }
    res.status(200).json({ success: true, qrCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch QR code details' });
  }
};

// Fetch QR codes for a user
export const getUserQRCodes = async (req, res) => {
  try {
    const { userId } = req.params;
    const qrCodes = await QR.find({ user: userId, isClaimed: true }).sort({ timestamp: -1 });
    res.status(200).json({ success: true, qrCodes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch QR codes' });
  }
};

// Fetch all QR codes (for all users)
export const getAllQRCodes = async (req, res) => {
  try {
    const qrCodes = await QR.find({})
      .sort({ timestamp: -1 })
      .populate('user', 'name email');
    res.status(200).json({ success: true, qrCodes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch QR codes' });
  }
};

export const deleteQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await QR.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }
    res.status(200).json({ success: true, message: 'QR code deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete QR code' });
  }
};

export const validateUserQRCode = async (req, res) => {
  try {
    const { qrValue, userId } = req.body;
    if (!qrValue || !userId) {
      return res.status(400).json({ success: false, message: 'QR value and userId are required' });
    }
    const qr = await QR.findOne({ value: qrValue, user: userId });
    if (!qr) {
      return res.status(403).json({ success: false, message: 'This QR code is not assigned to you.' });
    }
    res.status(200).json({ success: true, message: 'QR code is valid for this user.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to validate QR code' });
  }
};

// posting the lat and lgn
export const assignQRCode = async (req, res) => {
  try {
    const { userId, qrValue } = req.params;
    const { lat, lng } = req.body;
    if (!userId || !qrValue || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'userId, qrValue, lat, and lng are required' });
    }
    const qrCode = await QR.findOne({ value: qrValue });
    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }
    if (qrCode.isClaimed) {
      return res.status(400).json({ success: false, message: 'QR code is already claimed' });
    }
    qrCode.user = userId;
    qrCode.isClaimed = true;
    qrCode.location = { lat, lng };
    await qrCode.save();
    await qrCode.populate('user', 'name email');
    res.status(200).json({ success: true, qrCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to assign QR code' });
  }
};

// Assign a QR code by value, update lat, lng, and mark as claimed (do not update user)
export const assignQRCodeByValue = async (req, res) => {
  try {
    const { qrValue } = req.params;
    const { lat, lng } = req.body;
    if (!qrValue || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'qrValue, lat, and lng are required' });
    }
    // Find QR code by value
    const qrCode = await QR.findOne({ value: qrValue });
    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }
    // Update location, mark as claimed, and initialize path
    qrCode.isClaimed = true;
    qrCode.location = { lat, lng };
    qrCode.path = [{ lat, lng, timestamp: new Date() }];
    await qrCode.save();
    res.status(200).json({ success: true, qrCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to assign QR code' });
  }
};

// Append a new location to the path array for a QR code by value
export const appendQRPath = async (req, res) => {
  try {
    const { qrValue } = req.params;
    const { lat, lng } = req.body;
    if (!qrValue || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'qrValue, lat, and lng are required' });
    }
    const qrCode = await QR.findOne({ value: qrValue });
    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }
    // Append new location to path
    qrCode.path.push({ lat, lng, timestamp: new Date() });
    // Optionally update current location
    qrCode.location = { lat, lng };
    await qrCode.save();
    res.status(200).json({ success: true, qrCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to append QR path' });
  }
}; 