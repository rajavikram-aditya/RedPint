/**
 * Master seed script — runs all seeders in order.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const Admin = require('../models/Admin');
const { generateDonors } = require('./seedDonors');

const DEFAULT_PASSWORD = 'password123';

async function seedAll() {
  await connectDB();

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // --- 1. Admin ---
  console.log('\n👤 Seeding admin...');
  await Admin.deleteMany({ email: 'admin@redpint.app' });
  await Admin.create({
    name: 'RedPint Admin',
    email: 'admin@redpint.app',
    password: hashedPassword,
  });
  console.log(`✅ Admin created: admin@redpint.app / ${DEFAULT_PASSWORD}`);

  // --- 2. Hospitals ---
  console.log('\n🏥 Seeding hospitals...');
  const hospitals = [
    {
      email: 'kem@hospital.org',
      name: 'KEM Hospital',
      password: hashedPassword,
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
      password: hashedPassword,
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
      password: hashedPassword,
      address: 'Dr Ernest Borges Rd, Parel, Mumbai, Maharashtra 400012',
      latitude: 18.9986,
      longitude: 72.8413,
      contactNumber: '+912224177000',
      verified: true,
      rejected: false,
      licenseDocUrl: null,
    },
  ];

  await Hospital.deleteMany({ email: { $in: hospitals.map(h => h.email) } });
  const createdH = await Hospital.insertMany(hospitals);
  console.log(`✅ Inserted ${createdH.length} hospitals (password: ${DEFAULT_PASSWORD})`);

  // --- 3. Donors ---
  console.log('\n🩸 Seeding donors...');
  await Donor.deleteMany({});
  const donors = generateDonors(30, hashedPassword);
  const createdD = await Donor.insertMany(donors);
  console.log(`✅ Inserted ${createdD.length} donors (password: ${DEFAULT_PASSWORD})`);

  console.log('\n🎉 All seed data inserted successfully!');
  await mongoose.disconnect();
}

if (require.main === module) {
  seedAll().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = seedAll;
