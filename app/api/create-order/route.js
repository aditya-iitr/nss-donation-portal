import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/db";
import Donation from "@/models/Donation";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const { amount, userId } = await req.json();
    await connectDB();

    // 1. Ask Razorpay to create an order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    });

    // 2. Save "Pending" Record to Database
    await Donation.create({
      userId: userId,
      amount: amount,
      status: "Pending", // Important: Starts as pending [cite: 62]
      orderId: order.id,
      paymentId: "",
    });

    return NextResponse.json(order);

  } catch (error) {
    console.error("Order Error:", error);
    return NextResponse.json({ message: "Error creating order" }, { status: 500 });
  }
}