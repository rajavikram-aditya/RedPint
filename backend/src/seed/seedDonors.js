/**
 * Seed script — generate ~30 synthetic donors with realistic Mumbai coordinates
 * and Indian blood-group population distribution.
 * Run: node src/seed/seedDonors.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Donor = require('../models/Donor');
const connectDB = require('../config/db');

const DEFAULT_PASSWORD = 'password123';

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

const BLOOD_POOL = [
  ...Array(37).fill('O+'),
  ...Array(33).fill('B+'),
  ...Array(22).fill('A+'),
  ...Array(7).fill('AB+'),
  'O-',
];

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
  const start = [6, 7, 8, 9][Math.floor(Math.random() * 4)];
  let num = '' + start;
  for (let i = 0; i < 9; i++) num += Math.floor(Math.random() * 10);
  return `+91${num}`;
}

function randomPastDate(minDaysAgo, maxDaysAgo) {
  const daysAgo = minDaysAgo + Math.floor(Math.random() * (maxDaysAgo - minDaysAgo));
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
}

function generateDonors(count = 30, hashedPassword) {
  const donors = [];
  const usedEmails = new Set();

  for (let i = 0; i < count; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const name = `${firstName} ${lastName}`;

    let email;
    do {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}@example.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const hasDonated = Math.random() < 0.6;
    let lastDonationDate = null;
    if (hasDonated) {
      lastDonationDate =
        Math.random() < 0.5
          ? randomPastDate(10, 80)
          : randomPastDate(100, 365);
    }

    donors.push({
      name,
      email,
      password: hashedPassword,
      phone: randomPhone(),
      bloodGroup: randomElement(BLOOD_POOL),
      latitude: randomInRange(MUMBAI_LAT_MIN, MUMBAI_LAT_MAX),
      longitude: randomInRange(MUMBAI_LNG_MIN, MUMBAI_LNG_MAX),
      lastDonationDate,
      verified: true,
      documentUrl: null,
    });
  }

  return donors;
}

async function seedDonors() {
  await connectDB();
  console.log('🩸 Seeding donors...');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const donors = generateDonors(30, hashedPassword);
  const created = await Donor.insertMany(donors);

  const groupCounts = {};
  created.forEach((d) => {
    groupCounts[d.bloodGroup] = (groupCounts[d.bloodGroup] || 0) + 1;
  });
  console.log(`✅ Inserted ${created.length} donors (password: ${DEFAULT_PASSWORD}). Distribution:`);
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

module.exports = { seedDonors, generateDonors };
