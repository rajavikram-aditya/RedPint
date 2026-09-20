const mongoose = require('mongoose');
require('dotenv').config();

const Donor = require('./src/models/Donor');
const Hospital = require('./src/models/Hospital');
const Admin = require('./src/models/Admin');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const donors = await Donor.find({});
  const hospitals = await Hospital.find({});
  const admins = await Admin.find({});
  console.log("Donors:", donors.length, donors.map(d => ({ email: d.email, name: d.name })));
  console.log("Hospitals:", hospitals.length, hospitals.map(h => ({ email: h.email, name: h.name, verified: h.verified })));
  console.log("Admins:", admins.length, admins.map(a => ({ email: a.email, name: a.name })));
  process.exit(0);
}

check();
