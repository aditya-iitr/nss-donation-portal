"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // This function will handle the Razorpay payment
  const handleDonate = async () => {
    if (!amount) return alert("Please enter an amount");
    setLoading(true);

    try {
      // 1. Create Order (We will build this API next)
      const res = await fetch("/api/create-order", {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
      const order = await res.json();

      if (!res.ok) throw new Error("Order creation failed");

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "NSS Donation",
        description: "Contribution",
        order_id: order.id,
        handler: function (response) {
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            // Optional: Call backend to update status to Success here
            window.location.reload();
        },
        prefill: {
            name: "User Name", 
            email: "user@example.com",
            contact: "9999999999"
        },
        theme: { color: "#3399cc" }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
          alert("Payment Failed");
      });
      rzp1.open();

    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 px-4">
      {/* Script for Razorpay */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-blue-900">User Dashboard 👋</h1>
        <button 
          onClick={() => router.push("/")} 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-xl font-semibold mb-4">Make a Donation</h2>
        <p className="text-gray-500 mb-6">Support the cause with a secure contribution.</p>
        
        <div className="flex gap-2 mb-4">
            <span className="p-3 bg-gray-100 rounded-l-md font-bold text-gray-600">₹</span>
            <input 
                type="number" 
                placeholder="Enter Amount" 
                className="w-full p-3 border rounded-r-md outline-none focus:ring-2 focus:ring-blue-500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
        </div>

        <button 
            onClick={handleDonate}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition"
        >
            {loading ? "Processing..." : "Donate Now"}
        </button>
      </div>

      {/* History Section Placeholder */}
      <div className="mt-10 w-full max-w-4xl">
        <h3 className="text-lg font-bold text-gray-700 mb-4">Your Donation History</h3>
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No donations yet.
        </div>
      </div>
    </div>
  );
}