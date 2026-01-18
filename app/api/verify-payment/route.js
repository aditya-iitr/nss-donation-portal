import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Donation from "@/models/Donation";

export async function POST(req) {
  try {
    const { orderCreationId, razorpayPaymentId, razorpaySignature } = await req.json();

    // 1. Re-create the signature on your server
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(orderCreationId + "|" + razorpayPaymentId);
    const digest = shasum.digest("hex");

    // 2. Compare with Razorpay's signature
    if (digest !== razorpaySignature) {
      return NextResponse.json({ message: "Invalid Transaction" }, { status: 400 });
    }

    // 3. Signature Matched! Update Database to "Success"
    await connectDB();
    const updatedDonation = await Donation.findOneAndUpdate(
      { orderId: orderCreationId },
      { 
        status: "Success", 
        paymentId: razorpayPaymentId 
      },
      { new: true }
    );

    return NextResponse.json({ message: "Payment Verified", donation: updatedDonation });

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}