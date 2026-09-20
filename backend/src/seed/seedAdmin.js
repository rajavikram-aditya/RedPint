/**
 * Seed script — insert one Admin document.
 * Run: node src/seed/seedAdmin.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

const ADMIN_NAME = 'RedPint Admin';
const ADMIN_EMAIL = 'admin@redpint.app';
const ADMIN_PASSWORD = 'password123';

async function seedAdmin() {
  await connectDB();
  console.log('👤 Seeding admin...');

  await Admin.deleteMany({ email: ADMIN_EMAIL });

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await Admin.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
  });

  console.log(`✅ Admin created: ${admin.name} (${admin.email}) with password: ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
  console.log('Done.');
}

if (require.main === module) {
  seedAdmin().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = seedAdmin;
