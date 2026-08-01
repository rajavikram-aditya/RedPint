const HospitalStock = require('../models/HospitalStock');
const { asyncHandler } = require('../utils/helpers');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/**
 * GET /api/hospital-stock
 * Get stock for all hospitals or a specific hospital.
 * Query params: ?hospitalId=xxx
 */
exports.getStock = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.hospitalId) {
    filter.hospitalId = req.query.hospitalId;
  }

  const stock = await HospitalStock.find(filter)
    .populate('hospitalId', 'name address')
    .sort({ hospitalId: 1, bloodGroup: 1 });

  res.json({ success: true, stock });
});

/**
 * PUT /api/hospital-stock
 * Update stock for the logged-in hospital.
 * Body: { bloodGroup: 'A+', unitsAvailable: 10 }
 */
exports.updateStock = asyncHandler(async (req, res) => {
  const { bloodGroup, unitsAvailable } = req.body;

  if (!BLOOD_GROUPS.includes(bloodGroup)) {
    return res.status(400).json({ success: false, message: 'Invalid blood group' });
  }

  const stock = await HospitalStock.findOneAndUpdate(
    { hospitalId: req.userProfile._id, bloodGroup },
    {
      unitsAvailable: parseInt(unitsAvailable, 10),
      updatedAt: new Date(),
    },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ success: true, stock });
});

/**
 * POST /api/hospital-stock/bulk
 * Update multiple blood group stocks at once.
 * Body: { stocks: [{ bloodGroup: 'A+', unitsAvailable: 10 }, ...] }
 */
exports.bulkUpdateStock = asyncHandler(async (req, res) => {
  const { stocks } = req.body;
  if (!Array.isArray(stocks)) {
    return res.status(400).json({ success: false, message: 'stocks must be an array' });
  }

  const results = await Promise.all(
    stocks.map(({ bloodGroup, unitsAvailable }) =>
      HospitalStock.findOneAndUpdate(
        { hospitalId: req.userProfile._id, bloodGroup },
        { unitsAvailable: parseInt(unitsAvailable, 10), updatedAt: new Date() },
        { new: true, upsert: true, runValidators: true }
      )
    )
  );

  res.json({ success: true, stock: results });
});
