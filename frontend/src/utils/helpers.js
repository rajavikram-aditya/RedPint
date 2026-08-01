/**
 * Frontend helpers
 */

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/**
 * Check if a donor is eligible based on lastDonationDate (90-day cooldown).
 */
export function isDonorEligible(lastDonationDate) {
  if (!lastDonationDate) return true;
  const cooldownMs = 90 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(lastDonationDate).getTime() >= cooldownMs;
}

/**
 * Format a date for display.
 */
export function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Days until eligibility.
 */
export function daysUntilEligible(lastDonationDate) {
  if (!lastDonationDate) return 0;
  const cooldownMs = 90 * 24 * 60 * 60 * 1000;
  const elapsed = Date.now() - new Date(lastDonationDate).getTime();
  const remaining = cooldownMs - elapsed;
  return remaining > 0 ? Math.ceil(remaining / (24 * 60 * 60 * 1000)) : 0;
}
