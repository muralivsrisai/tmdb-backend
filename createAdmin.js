// createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);


  const admin = new User({
    username: "Admin",
    email: "admin",
    password: "admin",
    role: "admin"
  });

  await admin.save();
  console.log("✅ Admin created");
  process.exit();
};

run();
