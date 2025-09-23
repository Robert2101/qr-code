import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const sendVerificationSms = async (mobileNumber, otp) => {
    try {
        const formattedMobileNumber = `+91${mobileNumber}`;

        const messageBody = `Your OTP for EcoTrack is ${otp}. This is valid for 10 minutes.`;

        await client.messages.create({
            body: messageBody,
            from: twilioPhoneNumber,
            to: formattedMobileNumber,
        });

        console.log(`✅ Verification SMS sent to ${formattedMobileNumber}`);
        return true;

    } catch (error) {
        console.error(`💥 Failed to send SMS to ${mobileNumber}:`, error.message);
        return false;
    }
};