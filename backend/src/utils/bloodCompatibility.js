/**
 * Blood-type compatibility matrix (8×8).
 *
 * Key = recipient blood group
 * Value = array of donor blood groups that can donate to the recipient
 *
 * Based on ABO/Rh red-blood-cell compatibility rules:
 *   O- is universal donor  |  AB+ is universal recipient
 */
const COMPATIBILITY = {
  'O-':  ['O-'],
  'O+':  ['O-', 'O+'],
  'A-':  ['O-', 'A-'],
  'A+':  ['O-', 'O+', 'A-', 'A+'],
  'B-':  ['O-', 'B-'],
  'B+':  ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

/**
 * Given a recipient's blood group, return the list of donor blood groups
 * that are compatible (can donate red blood cells to this recipient).
 *
 * @param {string} recipientGroup - e.g. 'B+'
 * @returns {string[]} Compatible donor blood groups
 */
function getCompatibleDonorGroups(recipientGroup) {
  const groups = COMPATIBILITY[recipientGroup];
  if (!groups) {
    throw new Error(`Unknown blood group: ${recipientGroup}`);
  }
  return groups;
}

/**
 * Check if a specific donor blood group can donate to a recipient blood group.
 *
 * @param {string} donorGroup
 * @param {string} recipientGroup
 * @returns {boolean}
 */
function canDonate(donorGroup, recipientGroup) {
  return getCompatibleDonorGroups(recipientGroup).includes(donorGroup);
}

module.exports = { COMPATIBILITY, getCompatibleDonorGroups, canDonate };
