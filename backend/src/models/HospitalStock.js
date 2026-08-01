const mongoose = require('mongoose');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const hospitalStockSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: BLOOD_GROUPS,
    },
    unitsAvailable: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // we manage updatedAt manually
  }
);

// Each hospital can have only one stock entry per blood group
hospitalStockSchema.index({ hospitalId: 1, bloodGroup: 1 }, { unique: true });

module.exports = mongoose.model('HospitalStock', hospitalStockSchema);
