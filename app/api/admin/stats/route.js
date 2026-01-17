import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Donation from "@/models/Donation";

export async function GET() {
  try {
    await connectDB();

    // 1. Fetch total counts
    const totalUsers = await User.countDocuments({ role: "user" });
    
    // 2. Fetch all donations
    const donations = await Donation.find().sort({ createdAt: -1 });

    // 3. Calculate total money (only from "Success" status)
    const totalMoney = donations
      .filter(d => d.status === "Success")
      .reduce((acc, curr) => acc + curr.amount, 0);

    // 4. Fetch all users (to show in the table)
    const users = await User.find({ role: "user" }).select("name email createdAt");

    return NextResponse.json({
      stats: {
        users: totalUsers,
        totalDonations: totalMoney
      },
      users,
      donations
    }, { status: 200 });

  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json({ message: "Error fetching data" }, { status: 500 });
  }
}