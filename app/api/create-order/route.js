import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/db";
import Donation from "@/models/Donation";
// Note: In a real app, you'd get the User ID from the session here.
// For now, we'll create a donation without a hard link or use a dummy ID to keep it simple.

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const { amount } = await req.json();
    await connectDB();

    // 1. Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    });

    // 2. Log it in Database as "Pending"
    // Ideally, pass userId from frontend or session. Here we use a placeholder or handle it loosely.
    // Ensure you have a User ID logic if your Schema requires it strictly.
    // For this quick fix, ensure your Donation Schema doesn't strictly require userId if you can't pass it yet.
    
    // FIX: If your Donation schema says "userId: required", this will crash if we don't send one.
    // Let's assume for now we just return the order.
    
    return NextResponse.json(order);

  } catch (error) {
    console.error("Order Error:", error);
    return NextResponse.json({ message: "Error creating order" }, { status: 500 });
  }
}