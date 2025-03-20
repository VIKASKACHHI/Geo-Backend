import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    officeLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'OfficeLocation', required: true },
    checkInTime: { type: Date, required: true },
    checkInLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    checkOutTime: { type: Date },
    checkOutLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] }
    },
    status: { type: String, enum: ['checked-in', 'checked-out'], default: 'checked-in' },
    date: { type: Date, default: Date.now },
    notes: { type: String }
});

// **Ensure correct export for ES Module**
const Attendance = mongoose.model('Attendance', AttendanceSchema);
export default Attendance;
