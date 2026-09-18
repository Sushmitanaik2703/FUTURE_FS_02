require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("./config/database");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || "admin@crm.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      console.log(`Admin user already exists: ${email}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: "CRM Admin",
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
    });

    console.log(`Admin user created successfully: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error("Admin seed failed:", error);
    process.exit(1);
  }
};

seedAdmin();