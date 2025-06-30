import React, { useState } from "react";
import { baseUrl } from "../utils/url";
import { Link } from "react-router-dom";

export default function AdminSignup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/users/admin-singup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      setSuccess("Signup successful!");
      setFormData({ email: "", password: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 bg-[length:400%_400%] animate-gradientMotion overflow-hidden">
      {/* 🔮 Signup Card */}
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 animate-fade-in relative z-10">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-purple-800 font-[cursive]">Admin Signup</h1>
          <p className="text-sm text-gray-600">Katha Event Management Panel</p>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-3">{success}</p>}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full mb-4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={formData.email}
            onChange={handleChange}
          />

          <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={formData.password}
              onChange={handleChange}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-sm"
            >
              {showPassword ? "🙈 Hide" : "👁️ Show"}
            </span>
          </div>

          <label className="block text-sm font-medium mb-1 text-gray-700">Confirm Password</label>
          <div className="relative mb-4">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-sm"
            >
              {showConfirmPassword ? "🙈 Hide" : "👁️ Show"}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-lg transition duration-200"
          >
            Register Admin
          </button>
          <Link to='/'>
          <button
            type="submit"
            className="w-full py-2 mt-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-lg transition duration-200"
          >
            Login
          </button>
          </Link>
        </form>

        <div className="mt-6 text-xs text-center text-gray-400 font-sans">
          © {new Date().getFullYear()} Shrimad Bhagwat Katha • Admin Panel
        </div>
      </div>
    </div>
  );
}
