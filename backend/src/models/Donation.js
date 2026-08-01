const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
      index: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true,
    },
    donationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    unitsDonated: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Donation', donationSchema);
