/**
 * Seed script — generate ~30 synthetic donors with realistic Mumbai coordinates
 * and Indian blood-group population distribution.
 * Run: node src/seed/seedDonors.js
 */
const mongoose = require('mongoose');
require('dotenv').config();
const Donor = require('../models/Donor');
const connectDB = require('../config/db');

// ---------- Indian names pool ----------
const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun',
  'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Ananya', 'Diya', 'Myra', 'Sara', 'Aanya',
  'Aadhya', 'Isha', 'Riya', 'Kavya', 'Neha',
  'Rohan', 'Karan', 'Rahul', 'Priya', 'Sneha',
  'Amitabh', 'Pooja', 'Deepika', 'Vikram', 'Meera',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Gupta', 'Singh',
  'Kumar', 'Joshi', 'Iyer', 'Nair', 'Reddy',
  'Shah', 'Desai', 'Mehta', 'Rao', 'Menon',
];

// ---------- Blood group distribution (Indian population) ----------
// Weighted array — repeat groups proportionally (total ≈ 100 entries)
const BLOOD_POOL = [
  // O+ ~37%
  ...Array(37).fill('O+'),
  // B+ ~33%
  ...Array(33).fill('B+'),
  // A+ ~22%
  ...Array(22).fill('A+'),
  // AB+ ~7%
  ...Array(7).fill('AB+'),
  // Negatives — remaining ~1% split
  'O-',
];

// ---------- Mumbai coordinate bounds ----------
const MUMBAI_LAT_MIN = 18.89;
const MUMBAI_LAT_MAX = 19.27;
const MUMBAI_LNG_MIN = 72.77;
const MUMBAI_LNG_MAX = 72.98;

function randomInRange(min, max) {
  return +(min + Math.random() * (max - min)).toFixed(6);
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  // Indian mobile: +91 followed by 10 digits starting with 6-9
  const start = [6, 7, 8, 9][Math.floor(Math.random() * 4)];
  let num = '' + start;
  for (let i = 0; i < 9; i++) num += Math.floor(Math.random() * 10);
  return `+91${num}`;
}

function randomPastDate(minDaysAgo, maxDaysAgo) {
  const daysAgo = minDaysAgo + Math.floor(Math.random() * (maxDaysAgo - minDaysAgo));
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
}

function generateDonors(count = 30) {
  const donors = [];
  const usedEmails = new Set();

  for (let i = 0; i < count; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const name = `${firstName} ${lastName}`;

    // Ensure unique email
    let email;
    do {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}@example.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    // ~60% of donors have donated before (for testing cooldown logic)
    const hasDonated = Math.random() < 0.6;
    // Of those, half within cooldown (< 90 days), half outside
    let lastDonationDate = null;
    if (hasDonated) {
      lastDonationDate =
        Math.random() < 0.5
          ? randomPastDate(10, 80)   // within cooldown — NOT eligible
          : randomPastDate(100, 365); // past cooldown — eligible
    }

    donors.push({
      firebaseUid: `seed-donor-${i}`,
      name,
      email,
      phone: randomPhone(),
      bloodGroup: randomElement(BLOOD_POOL),
      latitude: randomInRange(MUMBAI_LAT_MIN, MUMBAI_LAT_MAX),
      longitude: randomInRange(MUMBAI_LNG_MIN, MUMBAI_LNG_MAX),
      lastDonationDate,
      verified: true, // all seed donors are verified for testing
      documentUrl: null,
    });
  }

  return donors;
}

async function seedDonors() {
  await connectDB();
  console.log('🩸 Seeding donors...');

  // Clear existing seed donors
  await Donor.deleteMany({ firebaseUid: { $regex: /^seed-donor-/ } });

  const donors = generateDonors(30);
  const created = await Donor.insertMany(donors);

  // Print summary
  const groupCounts = {};
  created.forEach((d) => {
    groupCounts[d.bloodGroup] = (groupCounts[d.bloodGroup] || 0) + 1;
  });
  console.log(`✅ Inserted ${created.length} donors. Distribution:`);
  Object.entries(groupCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([g, c]) => console.log(`   ${g}: ${c}`));

  await mongoose.disconnect();
  console.log('Done.');
}

if (require.main === module) {
  seedDonors().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = seedDonors;
