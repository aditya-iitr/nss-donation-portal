"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Determine Role based on Email Domain
  const getRole = (email) => {
    if (!email) return "user"; // Default to user if empty
    return email.endsWith("iitr.ac.in") ? "admin" : "user";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Detect Role
    const role = getRole(formData.email);
    console.log(`Attempting to ${isLogin ? "Login" : "Register"} as ${role}`);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }), 
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect based on role
        if (role === "admin") router.push("/admin/dashboard");
        else router.push("/user/dashboard");
      } else {
        alert(data.message || "Authentication failed!");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      
      {/* Optional: Add IIT Roorkee / NSS Logo here if you have one in public folder */}
      {/* <Image src="/nss-logo.png" alt="NSS Logo" width={80} height={80} className="mb-4" /> */}

      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-200">
        
        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-2">
          {isLogin ? "Welcome Back" : "Join NSS Portal"}
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          {isLogin ? "Sign in to manage donations" : "Register to start donating"}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field (Only for Register) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                name="name"
                type="text"
                required
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-black"
                onChange={handleChange}
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              name="email"
              type="email"
              required
              placeholder="user@gmail.com or admin@iitr.ac.in"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-black"
              onChange={handleChange}
            />
            {/* Helper Text for Role Detection */}
            {!isLogin && formData.email && (
              <p className="text-xs mt-1 text-gray-500">
                Detected Role: <span className="font-bold text-blue-600 uppercase">{getRole(formData.email)}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-black"
              onChange={handleChange}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition font-semibold"
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center border-t pt-4">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-semibold hover:underline"
            >
              {isLogin ? "Create Account" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}