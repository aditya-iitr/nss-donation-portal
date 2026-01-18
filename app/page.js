"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getRole = (email) => {
    if (!email) return "user";
    return email.endsWith("iitr.ac.in") ? "admin" : "user";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const role = getRole(formData.email);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }), 
      });

      const data = await res.json();

      if (res.ok) {
        
        if (!data.user || !data.user._id) {
            alert("Login successful but User ID is missing. Please check the backend.");
            return;
        }

        const userToSave = data.user;
        
        localStorage.setItem("user", JSON.stringify(userToSave));

        if (userToSave.role === "admin") {
            window.location.href = "/admin/dashboard";
        } else {
            window.location.href = "/user/dashboard";
        }
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
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-200">
        
        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-2">
          {isLogin ? "Welcome Back" : "Join NSS Portal"}
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm font-medium">
          {isLogin ? "Sign in to manage donations" : "Register to start donating"}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-gray-900">Full Name</label>
              <input 
                name="name" 
                type="text" 
                required 
                className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
                onChange={handleChange} 
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-900">Email Address</label>
            <input 
                name="email" 
                type="email" 
                required 
                placeholder="user@gmail.com or admin@iitr.ac.in"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400" 
                onChange={handleChange} 
            />
            {formData.email && (
                <p className="text-xs text-gray-600 mt-1 font-medium">
                    Detected Role: <span className="font-bold text-blue-700 uppercase">{getRole(formData.email)}</span>
                </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900">Password</label>
            <div className="relative mt-1">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none pr-10 text-gray-900" 
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-700 text-white py-2.5 rounded-md font-bold hover:bg-blue-800 transition shadow-sm">
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-700">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-700 font-bold hover:underline ml-1"
            >
              {isLogin ? "Create Account" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}