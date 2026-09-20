/**
 * Seed script — insert 3 real Mumbai hospitals.
 * Run: node src/seed/seedHospitals.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Hospital = require('../models/Hospital');
const connectDB = require('../config/db');

const DEFAULT_PASSWORD = 'password123';

const hospitals = [
  {
    email: 'kem@hospital.org',
    name: 'KEM Hospital',
    address: 'Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012',
    latitude: 19.0012,
    longitude: 72.8416,
    contactNumber: '+912224136051',
    verified: true,
    rejected: false,
    licenseDocUrl: null,
  },
  {
    email: 'lilavati@hospital.org',
    name: 'Lilavati Hospital',
    address: 'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050',
    latitude: 19.0509,
    longitude: 72.8289,
    contactNumber: '+912226751000',
    verified: true,
    rejected: false,
    licenseDocUrl: null,
  },
  {
    email: 'tata@hospital.org',
    name: 'Tata Memorial Hospital',
    address: 'Dr Ernest Borges Rd, Parel, Mumbai, Maharashtra 400012',
    latitude: 18.9986,
    longitude: 72.8413,
    contactNumber: '+912224177000',
    verified: true,
    rejected: false,
    licenseDocUrl: null,
  },
];

async function seedHospitals() {
  await connectDB();
  console.log('🏥 Seeding hospitals...');

  const emails = hospitals.map(h => h.email);
  await Hospital.deleteMany({ email: { $in: emails } });

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const hospitalsWithHash = hospitals.map(h => ({
    ...h,
    password: hashedPassword,
  }));

  const created = await Hospital.insertMany(hospitalsWithHash);
  console.log(`✅ Inserted ${created.length} hospitals (password: ${DEFAULT_PASSWORD}):`);
  created.forEach((h) => console.log(`   - ${h.name} (${h.email})`));

  await mongoose.disconnect();
  console.log('Done.');
}

if (require.main === module) {
  seedHospitals().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = seedHospitals;
