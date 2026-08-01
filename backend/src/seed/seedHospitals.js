/**
 * Seed script — insert 3 real Mumbai hospitals.
 * Run: node src/seed/seedHospitals.js
 */
const mongoose = require('mongoose');
require('dotenv').config();
const Hospital = require('../models/Hospital');
const connectDB = require('../config/db');

const hospitals = [
  {
    firebaseUid: 'seed-hospital-kem',
    name: 'KEM Hospital',
    address: 'Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012',
    latitude: 19.0012,
    longitude: 72.8416,
    contactNumber: '+912224136051',
    verified: true,
    licenseDocUrl: null,
  },
  {
    firebaseUid: 'seed-hospital-lilavati',
    name: 'Lilavati Hospital',
    address: 'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050',
    latitude: 19.0509,
    longitude: 72.8289,
    contactNumber: '+912226751000',
    verified: true,
    licenseDocUrl: null,
  },
  {
    firebaseUid: 'seed-hospital-tata',
    name: 'Tata Memorial Hospital',
    address: 'Dr Ernest Borges Rd, Parel, Mumbai, Maharashtra 400012',
    latitude: 18.9986,
    longitude: 72.8413,
    contactNumber: '+912224177000',
    verified: true,
    licenseDocUrl: null,
  },
];

async function seedHospitals() {
  await connectDB();
  console.log('🏥 Seeding hospitals...');

  // Clear existing seed hospitals
  await Hospital.deleteMany({ firebaseUid: { $regex: /^seed-hospital-/ } });

  const created = await Hospital.insertMany(hospitals);
  console.log(`✅ Inserted ${created.length} hospitals:`);
  created.forEach((h) => console.log(`   - ${h.name} (${h.latitude}, ${h.longitude})`));

  await mongoose.disconnect();
  console.log('Done.');
}

// Allow running standalone or as module
if (require.main === module) {
  seedHospitals().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = seedHospitals;
