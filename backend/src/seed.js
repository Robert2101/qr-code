import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/admin.model.js'; // Adjust the path to your Admin model

dotenv.config();

const admins = [
    {
        name: 'Admin1',
        email: 'admin1@gmail.com',
        password: '123456', // Plain text password, will be hashed below
    },
    {
        name: 'Admin2',
        email: 'admin2@gmail.com',
        password: '123456' // Plain text password, will be hashed below
    },
];

// --- Seeding Function ---
const seedDatabase = async () => {
    try {
        // 1. Connect to the database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully for seeding.');

        // 2. Clear existing admin data
        await Admin.deleteMany({});
        console.log('Existing admins deleted.');

        // 3. Hash passwords and prepare data for insertion
        const adminsWithHashedPasswords = await Promise.all(
            admins.map(async (admin) => {
                const salt = await bcrypt.genSalt(10); // Generate a salt
                const hashedPassword = await bcrypt.hash(admin.password, salt); // Hash the password
                return {
                    ...admin,
                    password: hashedPassword, // Replace plain password with the hash
                };
            })
        );

        // 4. Insert the new admin data
        await Admin.insertMany(adminsWithHashedPasswords);
        console.log('Admin data has been successfully seeded! 🌱');

    } catch (error) {
        console.error('Error seeding the database:', error);
    } finally {
        // 5. Disconnect from the database
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

// --- Execute the Seeding Function ---
seedDatabase();