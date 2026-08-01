const Match = require('../models/Match');
const { asyncHandler } = require('../utils/helpers');

/**
 * PATCH /api/matches/:id/respond
 * Donor accepts or declines a match.
 */
exports.respondToMatch = asyncHandler(async (req, res) => {
  const { responseStatus } = req.body; // 'accepted' or 'declined'

  if (!['accepted', 'declined'].includes(responseStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid response. Use "accepted" or "declined".' });
  }

  const match = await Match.findById(req.params.id);
  if (!match) {
    return res.status(404).json({ success: false, message: 'Match not found' });
  }

  // Verify the logged-in donor owns this match
  if (match.donorId.toString() !== req.userProfile._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not your match' });
  }

  if (match.responseStatus !== 'pending') {
    return res.status(400).json({ success: false, message: 'Already responded to this match' });
  }

  match.responseStatus = responseStatus;
  match.respondedAt = new Date();
  await match.save();

  res.json({
    success: true,
    message: `Match ${responseStatus} successfully.`,
    match,
  });
});
