import { useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { SigninInput } from "@gopiyadav989/unpolished";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Link, useNavigate } from "react-router-dom";

const SignupPage = () => {
  const [formData, setFormData] = useState<SigninInput>({
    email: "",
    password: "",
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const navigate = useNavigate();
  
  async function handleSubmit() {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/signin`, formData);
      const token = res.data.token;
      localStorage.setItem("token", token);
      navigate("/blogs");
    }
    catch (e) {
      alert("alert while signing up");
    }
  }


  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-serif bg-gray-50 text-gray-900">
      {/* Left Side: Signup Form */}
      <div className="flex flex-col justify-center items-center p-8">
        {/* Logo / Brand Name - Elegant & Minimal */}
        <h1 className="text-4xl font-bold mb-6">U.</h1>

        {/* Google Login Button - Refined */}
        <button type="button" className="flex items-center justify-center w-full max-w-sm border border-gray-800 text-gray-800 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 py-2 px-4 rounded-lg mb-4 transition">
          <span>Continue with Google</span>
        </button>

        {/* OR Divider - Clean & Simple */}
        <div className="flex items-center justify-center text-sm text-gray-500 mb-4 w-full max-w-sm">
          <hr className="border-t border-gray-300 flex-grow" />
          <span className="px-2">OR</span>
          <hr className="border-t border-gray-300 flex-grow" />
        </div>

        {/* Signup Form - Elegant & Contained */}
        <div className="w-full max-w-sm space-y-4">

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600 transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600 transition"
          />

          <button
            onClick={handleSubmit}
            className="w-full py-2 px-4 bg-black text-white rounded-lg shadow-md hover:bg-gray-800 transition-colors"
          >
            Signin
          </button>

          <p className="text-sm text-center text-gray-700">
            First Time! <Link to={"/signup"} className="underline">Signup</Link>
          </p>
        </div>
      </div>

      {/* Right Side: Tilted Article Preview */}
      <div className="hidden md:flex justify-center items-center p-8">
        <motion.div
          initial={{ rotate: -5, opacity: 0 }}
          animate={{ rotate: -3, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          whileHover={{ rotate: 0, scale: 1.02 }}
          className="shadow-lg max-w-xs"
        >
          <svg
            viewBox="0 0 300 400"
            width="300"
            height="400"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Card Background */}
            <rect width="300" height="400" fill="#ffffff" rx="8" />

            {/* Header */}
            <rect x="0" y="0" width="300" height="80" fill="#000" rx="8" />
            <text
              x="20"
              y="30"
              fontSize="12"
              fontFamily="serif"
              fill="#999"
              fontWeight="light"
            >
              LUXURY LIVING
            </text>
            <text
              x="20"
              y="55"
              fontSize="16"
              fontFamily="serif"
              fill="#fff"
              fontWeight="bold"
            >
              THE ART OF MODERN SPACES
            </text>

            {/* Divider Line */}
            <line
              x1="20"
              y1="100"
              x2="280"
              y2="100"
              stroke="#eee"
              strokeWidth="1"
            />

            {/* Article Content */}
            <text x="20" y="130" fontSize="14" fill="#333" fontWeight="bold">
              Minimalism Redefined
            </text>

            <text x="20" y="155" fontSize="12" fill="#666">
              Exploring the delicate balance between
            </text>
            <text x="20" y="175" fontSize="12" fill="#666">
              simplicity and sophistication in design.
            </text>

            {/* Abstract Architectural Illustration */}
            <g transform="translate(150, 250)">
              {/* Building elements */}
              <rect x="-80" y="-50" width="40" height="100" fill="#000" />
              <rect x="-30" y="-70" width="60" height="120" fill="#f5f5f5" stroke="#000" strokeWidth="1" />
              <rect x="40" y="-40" width="40" height="90" fill="#000" />

              {/* Lines representing framework */}
              <line x1="-80" y1="-20" x2="80" y2="-20" stroke="#000" strokeWidth="1" />
              <line x1="-60" y1="0" x2="60" y2="0" stroke="#000" strokeWidth="1" />
              <line x1="-70" y1="20" x2="70" y2="20" stroke="#000" strokeWidth="1" />

              {/* Circular element */}
              <circle cx="0" cy="-40" r="15" stroke="#000" strokeWidth="1" fill="none" />
            </g>

            {/* Read More Link */}
            <text x="20" y="370" fontSize="12" fill="#000" fontWeight="medium">
              Read More →
            </text>
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;