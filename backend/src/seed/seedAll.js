/**
 * Master seed script — runs all seeders in order.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');

async function seedAll() {
  await connectDB();

  // --- Hospitals ---
  const { default: _h } = { default: null }; // just to scope
  console.log('\n🏥 Seeding hospitals...');
  const hospitalData = require('./seedHospitals');
  // seedHospitals connects on its own, but we're already connected
  // so we inline the logic:
  const Hospital_ = require('../models/Hospital');
  await Hospital_.deleteMany({ firebaseUid: { $regex: /^seed-hospital-/ } });
  const hospitals = [
    {
      firebaseUid: 'seed-hospital-kem',
      name: 'KEM Hospital',
      address: 'Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012',
      latitude: 19.0012,
      longitude: 72.8416,
      contactNumber: '+912224136051',
      verified: true,
    },
    {
      firebaseUid: 'seed-hospital-lilavati',
      name: 'Lilavati Hospital',
      address: 'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050',
      latitude: 19.0509,
      longitude: 72.8289,
      contactNumber: '+912226751000',
      verified: true,
    },
    {
      firebaseUid: 'seed-hospital-tata',
      name: 'Tata Memorial Hospital',
      address: 'Dr Ernest Borges Rd, Parel, Mumbai, Maharashtra 400012',
      latitude: 18.9986,
      longitude: 72.8413,
      contactNumber: '+912224177000',
      verified: true,
    },
  ];
  const createdH = await Hospital_.insertMany(hospitals);
  console.log(`✅ Inserted ${createdH.length} hospitals`);

  // --- Donors ---
  console.log('\n🩸 Seeding donors...');
  const { generateDonors } = (() => {
    // inline the generator from seedDonors
    const mod = require('./seedDonors');
    // seedDonors exports the async function; we need the generator
    // Let's just call the module's generate logic directly
    return { generateDonors: null };
  })();

  // Actually, let's just re-use the seedDonors module properly
  const Donor_ = require('../models/Donor');
  await Donor_.deleteMany({ firebaseUid: { $regex: /^seed-donor-/ } });

  // Re-implement generator inline to avoid double-connect issues
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

  const randomInRange = (min, max) => +(min + Math.random() * (max - min)).toFixed(6);
  const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomPhone = () => {
    const start = [6, 7, 8, 9][Math.floor(Math.random() * 4)];
    let num = '' + start;
    for (let i = 0; i < 9; i++) num += Math.floor(Math.random() * 10);
    return `+91${num}`;
  };
  const randomPastDate = (minDays, maxDays) => {
    const daysAgo = minDays + Math.floor(Math.random() * (maxDays - minDays));
    return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  };

  const donors = [];
  const usedEmails = new Set();
  for (let i = 0; i < 30; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    let email;
    do {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}@example.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const hasDonated = Math.random() < 0.6;
    let lastDonationDate = null;
    if (hasDonated) {
      lastDonationDate = Math.random() < 0.5
        ? randomPastDate(10, 80)
        : randomPastDate(100, 365);
    }

    donors.push({
      firebaseUid: `seed-donor-${i}`,
      name: `${firstName} ${lastName}`,
      email,
      phone: randomPhone(),
      bloodGroup: randomElement(BLOOD_POOL),
      latitude: randomInRange(18.89, 19.27),
      longitude: randomInRange(72.77, 72.98),
      lastDonationDate,
      verified: true,
      documentUrl: null,
    });
  }

  const createdD = await Donor_.insertMany(donors);
  const groupCounts = {};
  createdD.forEach((d) => {
    groupCounts[d.bloodGroup] = (groupCounts[d.bloodGroup] || 0) + 1;
  });
  console.log(`✅ Inserted ${createdD.length} donors. Distribution:`);
  Object.entries(groupCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([g, c]) => console.log(`   ${g}: ${c}`));

  console.log('\n🎉 All seed data inserted successfully!');
  await mongoose.disconnect();
}

seedAll().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
