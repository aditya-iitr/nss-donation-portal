import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Donation from "@/models/Donation";

export async function POST(req) {
  try {
    const { orderId } = await req.json();
    await connectDB();

    console.log("Marking Order Failed:", orderId); // Check your terminal for this log!

    const updated = await Donation.findOneAndUpdate(
      { orderId: orderId },
      { status: "Failed" },
      { new: true }
    );

    if (!updated) {
        console.error("Order not found for failure update:", orderId);
        return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Marked as failed" });

  } catch (error) {
    console.error("Fail Update Error:", error);
    return NextResponse.json({ message: "Error updating status" }, { status: 500 });
  }
}