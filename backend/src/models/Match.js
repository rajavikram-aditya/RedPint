const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true,
      index: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
      index: true,
    },
    distanceKm: {
      type: Number,
      required: true,
    },
    responseStatus: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// A donor can only be matched once per request
matchSchema.index({ requestId: 1, donorId: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
