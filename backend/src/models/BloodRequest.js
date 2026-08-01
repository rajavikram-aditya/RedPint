const mongoose = require('mongoose');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const bloodRequestSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital ID is required'],
      index: true,
    },
    bloodGroupNeeded: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: BLOOD_GROUPS,
    },
    unitsRequired: {
      type: Number,
      required: [true, 'Units required is required'],
      min: 1,
    },
    urgencyLevel: {
      type: String,
      required: true,
      enum: ['normal', 'urgent', 'critical'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['pending', 'matched', 'fulfilled', 'expired'],
      default: 'pending',
      index: true,
    },
    // For inter-hospital requests: the hospital requesting blood FROM another hospital
    targetHospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
