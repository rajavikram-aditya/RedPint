const mongoose = require('mongoose');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const donorSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: BLOOD_GROUPS,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    documentUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for geo-based queries on blood group
donorSchema.index({ bloodGroup: 1, verified: 1 });

module.exports = mongoose.model('Donor', donorSchema);
