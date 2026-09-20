/**
 * Seed script — insert one Admin document.
 * Edit the constants below, then run: node src/seed/seedAdmin.js
 */
const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

// ─── Edit these before running ───────────────────────────────────────────────
const ADMIN_FIREBASE_UID = 'Y7ZBdxzhnYZzEw0KrgGz8JrOZRd2';
const ADMIN_NAME = 'RedPint Admin';
const ADMIN_EMAIL = 'admin@redpint.app';
// ─────────────────────────────────────────────────────────────────────────────

async function seedAdmin() {
  await connectDB();
  console.log('👤 Seeding admin...');

  const existing = await Admin.findOne({ firebaseUid: ADMIN_FIREBASE_UID });
  if (existing) {
    console.log(`✅ Admin already exists: ${existing.name} (${existing.email})`);
    await mongoose.disconnect();
    return;
  }

  const admin = await Admin.create({
    firebaseUid: ADMIN_FIREBASE_UID,
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
  });

  console.log(`✅ Admin created: ${admin.name} (${admin.email})`);
  await mongoose.disconnect();
  console.log('Done.');
}

// Allow running standalone or as module
if (require.main === module) {
  seedAdmin().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = seedAdmin;
