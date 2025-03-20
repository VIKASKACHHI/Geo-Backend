import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js'; // Ensure the file exists
import admin from 'firebase-admin';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error('Error in register:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Middleware to verify Firebase token
export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

// Export as ES Module
//this the export line

export default router;
