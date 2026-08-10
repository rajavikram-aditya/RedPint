const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const { getCompatibleDonorGroups } = require('../utils/bloodCompatibility');
const { haversineDistance } = require('../utils/haversine');
const { isDonorEligible, asyncHandler } = require('../utils/helpers');

/**
 * POST /api/blood-requests
 * Hospital creates a blood request. Triggers the matching engine.
 */
exports.createRequest = asyncHandler(async (req, res) => {
  const hospital = req.userProfile;
  const { bloodGroupNeeded, unitsRequired, urgencyLevel } = req.body;

  const request = await BloodRequest.create({
    hospitalId: hospital._id,
    bloodGroupNeeded,
    unitsRequired: parseInt(unitsRequired, 10),
    urgencyLevel: urgencyLevel || 'normal',
    status: 'pending',
  });

  // --- Run matching engine ---
  const matchResults = await runMatchingEngine(request, hospital);

  res.status(201).json({
    success: true,
    message: `Blood request created. ${matchResults.matchCount} compatible donors found.`,
    request,
    matchCount: matchResults.matchCount,
  });
});

/**
 * POST /api/blood-requests/inter-hospital
 * Hospital-to-hospital blood request.
 */
exports.createInterHospitalRequest = asyncHandler(async (req, res) => {
  const hospital = req.userProfile;
  const { targetHospitalId, bloodGroupNeeded, unitsRequired, urgencyLevel } = req.body;

  const request = await BloodRequest.create({
    hospitalId: hospital._id,
    targetHospitalId,
    bloodGroupNeeded,
    unitsRequired: parseInt(unitsRequired, 10),
    urgencyLevel: urgencyLevel || 'normal',
    status: 'pending',
  });

  // Notify the target hospital
  await Notification.create({
    userId: targetHospitalId,
    userType: 'hospital',
    message: `${hospital.name} is requesting ${unitsRequired} unit(s) of ${bloodGroupNeeded} blood.`,
  });

  res.status(201).json({
    success: true,
    message: 'Inter-hospital request created and target hospital notified.',
    request,
  });
});

/**
 * GET /api/blood-requests/:id
 * Get a single blood request by ID.
 */
exports.getRequest = asyncHandler(async (req, res) => {
  const request = await BloodRequest.findById(req.params.id)
    .populate('hospitalId', 'name address contactNumber')
    .populate('targetHospitalId', 'name address contactNumber');

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  res.json({ success: true, request });
});

/**
 * GET /api/blood-requests/:id/matches
 * Get all matches for a specific blood request.
 */
exports.getMatchesForRequest = asyncHandler(async (req, res) => {
  const matches = await Match.find({ requestId: req.params.id })
    .populate('donorId', 'name email phone bloodGroup latitude longitude')
    .sort({ distanceKm: 1 });

  const processedMatches = matches.map(match => {
    const matchObj = match.toObject();
    if (matchObj.responseStatus !== 'accepted' && matchObj.donorId) {
      delete matchObj.donorId.email;
      delete matchObj.donorId.phone;
    }
    return matchObj;
  });

  res.json({ success: true, matches: processedMatches });
});

/**
 * GET /api/hospitals/me/requests
 * Get all blood requests for the logged-in hospital.
 */
exports.getMyRequests = asyncHandler(async (req, res) => {
  const requests = await BloodRequest.find({ hospitalId: req.userProfile._id })
    .sort({ createdAt: -1 });

  res.json({ success: true, requests });
});

/**
 * GET /api/blood-requests
 * Get all open blood requests across the network.
 */
exports.getAllRequests = asyncHandler(async (req, res) => {
  const requests = await BloodRequest.find({ status: { $in: ['pending', 'matched'] } })
    .populate('hospitalId', 'name address latitude longitude')
    .sort({ createdAt: -1 });

  res.json({ success: true, requests });
});

// ===================== MATCHING ENGINE =====================

/**
 * Core matching engine.
 * Given a BloodRequest and its hospital, finds compatible eligible donors,
 * ranks them by distance, creates Match records, and sends mocked notifications.
 */
async function runMatchingEngine(request, hospital) {
  // 1. Get compatible donor blood groups
  const compatibleGroups = getCompatibleDonorGroups(request.bloodGroupNeeded);

  // 2. Query eligible donors
  const cooldownDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const donors = await Donor.find({
    bloodGroup: { $in: compatibleGroups },
    verified: true,
    $or: [
      { lastDonationDate: null },
      { lastDonationDate: { $lte: cooldownDate } },
    ],
  });

  // 3. Calculate distances and sort
  const donorsWithDistance = donors.map((donor) => ({
    donor,
    distance: haversineDistance(
      hospital.latitude,
      hospital.longitude,
      donor.latitude,
      donor.longitude
    ),
  }));

  donorsWithDistance.sort((a, b) => a.distance - b.distance);

  // 4. Create Match records
  const matchDocs = donorsWithDistance.map(({ donor, distance }) => ({
    requestId: request._id,
    donorId: donor._id,
    distanceKm: distance,
    responseStatus: 'pending',
  }));

  if (matchDocs.length > 0) {
    await Match.insertMany(matchDocs);

    // 5. Update request status
    request.status = 'matched';
    await request.save();

    // 6. Create mocked notifications for each matched donor
    const notifications = donorsWithDistance.map(({ donor }) => ({
      userId: donor._id,
      userType: 'donor',
      message: `Urgent: ${hospital.name} needs ${request.bloodGroupNeeded} blood (${request.urgencyLevel}). You are a compatible donor — please respond.`,
    }));
    await Notification.insertMany(notifications);

    // 7. Notify the hospital
    await Notification.create({
      userId: hospital._id,
      userType: 'hospital',
      message: `Request sent to ${matchDocs.length} matched donor(s) for ${request.bloodGroupNeeded} blood.`,
    });
  }

  return { matchCount: matchDocs.length };
}
