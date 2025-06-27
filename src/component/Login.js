import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { baseUrl } from '../utils/url';
import { IoEye } from "react-icons/io5";
import { IoMdEyeOff } from "react-icons/io";
import Swal from 'sweetalert2';

export const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${baseUrl}/users/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        Swal.fire({
          icon: "success",
          title: "success!",
          text: "Login successful!",
        });
        navigate('/adminformData');
      } else {
        alert(data.message || 'Login failed');
         Swal.fire({
          icon: "Error",
          title: "Error!",
          text: "Login failed",
        });
      }
    } catch (err) {
       Swal.fire({
         icon: "Error",
         title: "login failed!",
         text: err,
       });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage: `url('/Har_Ki_Pauri,_Haridwar.jpg')`,
      }}
    >
      <div className="relative z-10 w-full max-w-sm bg-white/90 backdrop-blur-md border-2 border-yellow-600 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold text-yellow-900 text-center mb-2">
          ભાગવત ભાગીરથી કથા
        </h2>
        <p className="text-center text-yellow-800 mb-6 text-sm sm:text-base">
          ગંગા સંગ ભક્તિનો રંગ – ચાલો હરિદ્વારની ઓર!
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-yellow-900 font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600"
              required
            />
          </div>

          <div>
            <label className="block text-yellow-900 font-semibold mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-800"
              >
                {showPassword ? <IoMdEyeOff size={18} /> : <IoEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-700 text-white py-2 rounded-md hover:bg-yellow-800 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center text-yellow-800 mt-4 italic">
          જય શ્રી કૃષ્ણ 🙏
        </p>
      </div>

      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-0"></div>
    </div>
  );
};
