const mongoose = require('mongoose');
require('dotenv').config();

const Donor = require('./src/models/Donor');
const Hospital = require('./src/models/Hospital');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const donors = await Donor.find({});
  const hospitals = await Hospital.find({});
  console.log("Donors:", donors.length, donors.map(d => ({ email: d.email, firebaseUid: d.firebaseUid })));
  console.log("Hospitals:", hospitals.length, hospitals.map(h => ({ email: h.email, firebaseUid: h.firebaseUid })));
  process.exit(0);
}

check();
