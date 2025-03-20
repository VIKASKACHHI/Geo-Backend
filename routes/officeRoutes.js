import express from 'express';
const router = express.Router();
import OfficeLocation from '../models/OfficeLocation.js';
import { verifyToken } from './auth.js';

/**
 * @route   GET /api/office-location
 * @desc    Get all office locations
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const officeLocations = await OfficeLocation.find({ 
      $or: [
        { isActive: { $ne: false } },
        { isActive: { $exists: false } }
      ]
    });
    res.json(officeLocations);
  } catch (error) {
    console.error('Error fetching office locations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/office-location/:id
 * @desc    Get office location by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const officeLocation = await OfficeLocation.findById(req.params.id);
    
    if (!officeLocation) {
      return res.status(404).json({ message: 'Office location not found' });
    }
    
    res.json(officeLocation);
  } catch (error) {
    console.error('Error fetching office location:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/office-location
 * @desc    Create a new office location
 * @access  Private (Admin only)
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { name, address, longitude, latitude, radius } = req.body;
    
    // Validate required fields
    if (!name || !address || !longitude || !latitude) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Create new office location
    const newOfficeLocation = new OfficeLocation({
      name,
      address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      radius: radius || process.env.MAX_DISTANCE_METERS || 200
    });
    
    const savedLocation = await newOfficeLocation.save();
    res.status(201).json(savedLocation);
  } catch (error) {
    console.error('Error creating office location:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Office location with this name already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/office-location/:id
 * @desc    Update an office location
 * @access  Private (Admin only)
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { name, address, longitude, latitude, radius, isActive } = req.body;
    
    // Find office location
    const officeLocation = await OfficeLocation.findById(req.params.id);
    
    if (!officeLocation) {
      return res.status(404).json({ message: 'Office location not found' });
    }
    
    // Update fields if provided
    if (name) officeLocation.name = name;
    if (address) officeLocation.address = address;
    if (longitude && latitude) {
      officeLocation.location.coordinates = [
        parseFloat(longitude),
        parseFloat(latitude)
      ];
    }
    if (radius) officeLocation.radius = radius;
    if (isActive !== undefined) officeLocation.isActive = isActive;
    
    const updatedLocation = await officeLocation.save();
    res.json(updatedLocation);
  } catch (error) {
    console.error('Error updating office location:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Office location with this name already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/office-location/:id
 * @desc    Delete an office location
 * @access  Private (Admin only)
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const officeLocation = await OfficeLocation.findById(req.params.id);
    
    if (!officeLocation) {
      return res.status(404).json({ message: 'Office location not found' });
    }
    
    await officeLocation.remove();
    res.json({ message: 'Office location deleted successfully' });
  } catch (error) {
    console.error('Error deleting office location:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;