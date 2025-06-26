import React from 'react';
import { Link } from 'react-router-dom';

export const Login = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage: `url('/Har_Ki_Pauri,_Haridwar.jpg')`, // Ensure this is in public/
      }}
    >
      <div className="relative z-10 w-full max-w-sm bg-white/90 backdrop-blur-md border-2 border-yellow-600 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold text-yellow-900 text-center mb-2">
          ભાગવત ભાગીરથી કથા
        </h2>
        <p className="text-center text-yellow-800 mb-6 text-sm sm:text-base">
          ગંગા સંગ ભક્તિનો રંગ – ચાલો હરિદ્વારની ઓર!
        </p>
        <form className="space-y-4">
          <div>
            <label className="block text-yellow-900 font-semibold mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600"
            />
          </div>
          <div>
            <label className="block text-yellow-900 font-semibold mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-700 text-white py-2 rounded-md hover:bg-yellow-800 transition"
          >
            Login
          </button>
        </form>
        <Link to="/signup">
          <span className="text-base cursor-pointer justify-center flex font-semibold text-yellow-800 mt-4 italic">
            Sign Up
          </span>
        </Link>
        <p className="text-sm text-center text-yellow-800 mt-4 italic">
          જય શ્રી કૃષ્ણ 🙏
        </p>
      </div>

      {/* Optional background overlay for mobile clarity */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-0"></div>
    </div>
  );
};
