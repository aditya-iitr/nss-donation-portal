import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Donation from "@/models/Donation";

export async function POST(req) {
  try {
    const { userId } = await req.json();
    await connectDB();

    // --- 1. CLEANUP: Auto-Fail Pending Payments Older than 15 Minutes ---
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000); // 15 Minutes

    await Donation.updateMany(
      { 
        userId: userId, 
        status: "Pending", 
        createdAt: { $lt: fifteenMinsAgo } 
      },
      { 
        $set: { status: "Failed" } 
      }
    );
    // --------------------------------------------------------------------

    const donations = await Donation.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ donations });

  } catch (error) {
    console.error("History Fetch Error:", error);
    return NextResponse.json({ message: "Error fetching history" }, { status: 500 });
  }
}