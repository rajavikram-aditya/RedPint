const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Drive location description is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    date: {
      type: Date,
      required: [true, 'Drive date is required'],
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    registeredDonors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor'
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Drive', driveSchema);
