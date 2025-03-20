import mongoose from 'mongoose';

const OfficeLocationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    radius: { type: Number, required: true }, // Radius in meters
    isActive: { type: Boolean, default: true }
});

// ✅ Ensure correct ES Module export
const OfficeLocation = mongoose.model('OfficeLocation', OfficeLocationSchema, 'office_locations');
export default OfficeLocation;
//end 