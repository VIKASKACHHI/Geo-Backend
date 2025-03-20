import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/auth.js'; // Make sure file has .js extension
import attendanceRoutes from './routes/attendance.js';
import officeRoutes from './routes/officeRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected!"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/office_location', officeRoutes);

// Add a route handler for the root path
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Employee Attendance Tracking API',
        endpoints: {
            auth: '/api/auth',
            attendance: '/api/attendance',
            officeLocation: '/api/office-location'
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
