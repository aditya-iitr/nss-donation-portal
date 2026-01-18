"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, History, CreditCard, LogOut } from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState(null);
  const [donations, setDonations] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // 1. Fetch Data on Load
  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.push("/");
          return;
        }
        const user = JSON.parse(storedUser);
        setUserData(user);

        // Fetch History
        const res = await fetch("/api/user/history", {
          method: "POST",
          body: JSON.stringify({ userId: user._id || user.id }),
        });
        if (res.ok) {
          const data = await res.json();
          setDonations(data.donations);
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsPageLoading(false);
      }
    };
    init();
  }, []);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDonate = async () => {
    if (!amount || amount <= 0) return alert("Please enter a valid amount");
    setLoading(true);

    try {
      const resLoaded = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js",
      );
      if (!resLoaded) {
        alert("Razorpay SDK failed to load.");
        setLoading(false);
        return;
      }

      // 1. Create Order
      const res = await fetch("/api/create-order", {
        method: "POST",
        body: JSON.stringify({ amount, userId: userData._id || userData.id }),
      });

      if (!res.ok) throw new Error("Order creation failed");
      const order = await res.json();

      let isPaymentHandled = false;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "NSS IIT Roorkee",
        description: "Donation Contribution",
        order_id: order.id,

        // A. SUCCESS HANDLER
        handler: async function (response) {
          isPaymentHandled = true;
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderCreationId: order.id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              alert("Payment Successful! 🎉");
            } else {
              alert("Payment Verification Failed");
            }
          } catch (err) {
            console.error(err);
          }
          // REFRESH PAGE
          window.location.reload();
        },

        // B. CLOSE/DISMISS HANDLER (User clicks X)
        modal: {
          ondismiss: async function () {
            if (isPaymentHandled) return;

            try {
              // Tell DB to mark as Failed
              await fetch("/api/payment-failed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id }),
              });
            } catch (err) {
              console.error("Failed to mark status", err);
            }

            alert("Payment Cancelled.");
            // REFRESH PAGE
            window.location.reload();
          },
        },
        prefill: {
          name: userData?.name || "User",
          email: userData?.email || "user@example.com",
          contact: "9999999999",
        },
        theme: { color: "#2563EB" },
      };

      const rzp1 = new window.Razorpay(options);

      // C. FAILURE HANDLER (User clicks Failure button)
      rzp1.on("payment.failed", async function (response) {
        isPaymentHandled = true;

        try {
          // Wait for DB update to finish
          await fetch("/api/payment-failed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: order.id }),
          });
        } catch (err) {
          console.error("Failed to mark status", err);
        }

        alert(
          "Payment Failed: " +
            (response.error.description || "Transaction declined"),
        );

        // REFRESH PAGE
        window.location.reload();
      });

      rzp1.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
      setLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-6 px-4 pb-12 font-sans">
      <style jsx global>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>

      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
            N
          </div>
          <h1 className="text-xl font-bold text-blue-900 tracking-tight">
            NSS Donation Portal
          </h1>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("user"); // 1. Clear Data
            window.location.href = "/"; // 2. Force Hard Reload (Clears History Cache)
          }}
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition font-medium text-sm"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile & Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-600">
            <div className="flex items-center gap-2 mb-4">
              <User className="text-blue-600" size={20} />
              <h2 className="text-lg font-bold text-gray-800">My Profile</h2>
            </div>
            {userData ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                    Full Name
                  </p>
                  <p className="text-gray-800 font-semibold text-lg">
                    {userData.name}
                  </p>
                </div>
                <div className="pb-3 border-b border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                    Email Address
                  </p>
                  <p className="text-gray-800 font-medium">{userData.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                    Role
                  </p>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold uppercase">
                    {userData.role || "User"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Loading profile...</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="text-green-600" size={20} />
              <h2 className="text-lg font-bold text-gray-800">Donate Now</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Your contribution supports our NSS initiatives.
            </p>

            <div className="relative mb-4">
              <span className="absolute left-4 top-3.5 text-gray-500 font-bold text-lg">
                ₹
              </span>
              <input
                type="number"
                placeholder="Enter Amount"
                className="w-full pl-10 p-3.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition text-gray-900 font-semibold text-lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <button
              onClick={handleDonate}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3.5 rounded-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-100 active:scale-95"
            >
              {loading ? "Processing..." : "Proceed to Pay"}
            </button>
          </div>
        </div>

        {/* History */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <History className="text-purple-600" size={20} />
            <h2 className="text-lg font-bold text-gray-800">
              Donation History
            </h2>
          </div>

          {donations.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <CreditCard className="mx-auto text-gray-300 mb-2" size={40} />
              <p className="text-gray-500 font-medium">
                No donations made yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="p-4 font-semibold rounded-tl-lg">Date</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Order ID</th>
                    <th className="p-4 font-semibold rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donations.map((d) => (
                    <tr
                      key={d._id}
                      className="hover:bg-gray-50 transition group"
                    >
                      <td className="p-4 text-sm text-gray-600 font-medium">
                        {new Date(d.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-4 font-bold text-gray-800">
                        ₹{d.amount}
                      </td>
                      <td className="p-4 text-xs text-gray-400 font-mono">
                        {d.orderId || "N/A"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                            d.status === "Success"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : d.status === "Failed"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
