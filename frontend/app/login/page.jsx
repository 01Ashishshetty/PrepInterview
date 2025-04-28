"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" }); // State for error messages

  const validateInputs = () => {
    let tempErrors = { email: "", password: "" };
    if (!email) tempErrors.email = "Please provide your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      tempErrors.email = "Please use a valid email format (e.g., demo@gmail.com).";
    if (!password) tempErrors.password = "Please enter your password.";
    setErrors(tempErrors);
    return Object.values(tempErrors).every((error) => !error);
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userPhone", data.user.phone);
        localStorage.setItem("userLoggedIn", "true");
        router.push("/");
      } else {
        setErrors({ email: data.message, password: data.message }); // Set generic error if backend fails
      }
    } catch (error) {
      setErrors({
        email: "Oops! Something went wrong. Please try again or contact support.",
        password: "Oops! Something went wrong. Please try again or contact support.",
      });
    }
  };

  return (
    <div className="flex h-screen w-full">
      <div className="hidden lg:flex w-0 lg:w-2/3 justify-center items-center bg-[#f2f6fa]">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/videos/interview2.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="w-full lg:w-1/3 flex flex-col bg-white justify-center items-center px-4 sm:px-6 md:px-12 relative">
        <Link href="/">
          <div className="absolute top-28 left-1/2 transform -translate-x-1/2 cursor-pointer">
            <Image src="/images/interv1-removebg.png" alt="PrepInterview Logo" width={200} height={50} />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4 sm:mb-6">Welcome Back</h2>
        <div className="w-full mb-2 sm:mb-5 relative">
          <input
            type="text"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({ ...errors, email: "" }); // Clear error on change
            }}
            className={`w-full p-3 text-gray-900 bg-white border-2 rounded-lg focus:outline-none peer ${
              errors.email ? "border-red-500" : ""
            }`}
            style={{ borderColor: isFocused.email ? "#5d87ff" : errors.email ? "#ef4444" : "#dfe5ef" }}
            onFocus={() => setIsFocused({ ...isFocused, email: true })}
            onBlur={() => setIsFocused({ ...isFocused, email: false })}
          />
          <label
            className={`absolute left-2 transition-all duration-200 pointer-events-none ${
              isFocused.email || email ? "text-sm -top-2 text-[#5d87ff] bg-white px-1" : "top-3 text-gray-500"
            }`}
          >
            Email
          </label>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <FaExclamationCircle className="mr-1" /> {errors.email}
            </p>
          )} {/* Error message with icon */}
        </div>
        <div className="w-full mb-2 sm:mb-4 relative">
          <div
            className={`flex items-center border-2 rounded-lg ${
              errors.password ? "border-red-500" : ""
            }`}
            style={{ borderColor: isFocused.password ? "#5d87ff" : errors.password ? "#ef4444" : "#dfe5ef" }}
          >
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: "" }); // Clear error on change
              }}
              className="w-full p-3 text-gray-900 bg-white rounded-lg focus:outline-none peer"
              onFocus={() => setIsFocused({ ...isFocused, password: true })}
              onBlur={() => setIsFocused({ ...isFocused, password: false })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>
          <label
            className={`absolute left-2 transition-all duration-200 pointer-events-none ${
              isFocused.password || password ? "text-sm -top-2 text-[#5d87ff] bg-white px-1" : "top-3 text-gray-500"
            }`}
          >
            Password
          </label>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <FaExclamationCircle className="mr-1" /> {errors.password}
            </p>
          )} {/* Error message with icon */}
        </div>
        <div className="flex justify-end mb-2 sm:mb-4 w-full">
          <Link href="/forgot-password" className="text-[#5d87ff] text-sm sm:text-base">
            Forgot Password?
          </Link>
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-[#5d87ff] text-white p-2 sm:p-3 rounded-lg hover:bg-[#4570ea]"
        >
          Sign In
        </button>
        <p className="text-center text-gray-600 font-light mt-2 sm:mt-4 text-sm sm:text-base">
          Don't have an Account?{" "}
          <Link href="/register" className="text-[#5d87ff]">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}