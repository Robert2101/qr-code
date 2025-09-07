import QRCode from 'qrcode';
import cloudinary from '../config/cloudinary.js';

// Test function to generate a QR code and upload to Cloudinary
async function testQrCodeGeneration() {
  try {
    console.log('Testing QR code generation and Cloudinary upload...');
    
    // Generate a test QR code
    const testId = 'test-' + Date.now();
    const qrDataUrl = await QRCode.toDataURL(testId);
    console.log('QR code generated successfully');
    
    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
      folder: "qr_codes",
      public_id: `test_qr_${testId}`,
      overwrite: true
    });
    
    console.log('QR code uploaded to Cloudinary successfully');
    console.log('Secure URL:', uploadResult.secure_url);
    
    return uploadResult.secure_url;
  } catch (error) {
    console.error('Error in QR code test:', error);
    throw error;
  }
}

// Run the test
testQrCodeGeneration()
  .then(url => {
    console.log('Test completed successfully with URL:', url);
    process.exit(0);
  })
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });