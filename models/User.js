import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true
    /// spparse true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['employee', 'admin', 'manager'],
    default: 'employee'
  },
  department: {
    type: String,
    required: false
  },
  employeeId: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default model('User', userSchema);