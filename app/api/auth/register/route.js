import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();

    // 1. Connect to Database
    await connectDB();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // 3. Encrypt the password (Security)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create the User in MongoDB
    await User.create({
      name,
      email,
      password: hashedPassword,
      role, // "admin" or "user"
    });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "Error registering user" }, { status: 500 });
  }
}