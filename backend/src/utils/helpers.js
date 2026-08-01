/**
 * Shared helper utilities.
 */

/** Donor eligibility cooldown period in days */
const COOLDOWN_DAYS = 90;

/**
 * Check if a donor is eligible to donate based on their last donation date.
 * A donor must wait at least COOLDOWN_DAYS since their last donation.
 *
 * @param {Date|null} lastDonationDate
 * @returns {boolean} true if eligible
 */
function isDonorEligible(lastDonationDate) {
  if (!lastDonationDate) return true; // never donated — eligible
  const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(lastDonationDate).getTime() >= cooldownMs;
}

/**
 * Wrap an async Express route handler to catch errors and forward them
 * to the Express error handler instead of crashing the process.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { COOLDOWN_DAYS, isDonorEligible, asyncHandler };
