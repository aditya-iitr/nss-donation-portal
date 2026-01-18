import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Donation from "@/models/Donation";

export async function GET() {
  try {
    await connectDB();

    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

    await Donation.updateMany(
      { 
        status: "Pending", 
        createdAt: { $lt: fifteenMinsAgo } 
      },
      { 
        $set: { status: "Failed" } 
      }
    );

    // 2. Fetch Data
    const users = await User.find({}).sort({ createdAt: -1 });
    const donations = await Donation.find({}).sort({ createdAt: -1 });

    const totalDonations = donations
      .filter((d) => d.status === "Success")
      .reduce((sum, d) => sum + d.amount, 0);

    return NextResponse.json({
      users, 
      donations,
      stats: {
        users: users.length,
        totalDonations,
      },
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json(
      { message: "Error fetching stats" },
      { status: 500 }
    );
  }
}