import mongoose from "mongoose";

const DonationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Success", "Failed"], 
    default: "Pending" 
  },
  paymentId: { type: String }, // Stores Razorpay Payment ID
  orderId: { type: String },   // Stores Razorpay Order ID
}, { timestamps: true });

export default mongoose.models.Donation || mongoose.model("Donation", DonationSchema);