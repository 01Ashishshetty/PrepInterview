"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RegisterPage() {
  const router = useRouter();
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  }); // State for error messages

  const validateInputs = () => {
    let tempErrors = { name: "", email: "", phone: "", password: "" };
    if (!name) tempErrors.name = "Please enter your name.";
    if (!email) tempErrors.email = "Please provide your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      tempErrors.email = "Please use a valid email format (e.g., example@domain.com).";
    if (!phone) tempErrors.phone = "Please add your phone number.";
    else if (!/^\+?[1-9]\d{0,9}$/.test(phone))
      tempErrors.phone = "Please enter a phone number up to 10 digits.";
    if (!password) tempErrors.password = "Please enter a password.";
    else if (password.length < 8)
      tempErrors.password = "Please use a password with at least 8 characters for security.";
    setErrors(tempErrors);
    return Object.values(tempErrors).every((error) => !error);
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/login");
      } else {
        setErrors({
          name: data.message,
          email: data.message,
          phone: data.message,
          password: data.message,
        }); // Set generic error if backend fails
      }
    } catch (error) {
      setErrors({
        name: "Oops! Something went wrong. Please try again or contact support.",
        email: "Oops! Something went wrong. Please try again or contact support.",
        phone: "Oops! Something went wrong. Please try again or contact support.",
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
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 cursor-pointer">
            <Image src="/images/interv1-removebg.png" alt="PrepInterview Logo" width={200} height={50} />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4 sm:mb-6">Create an account</h2>
        <div className="w-full mb-2 sm:mb-4 relative">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors({ ...errors, name: "" }); // Clear error on change
            }}
            className={`w-full p-3 text-gray-900 bg-white border-2 rounded-lg focus:outline-none peer ${
              errors.name ? "border-red-500" : ""
            }`}
            style={{ borderColor: isFocused.name ? "#5d87ff" : errors.name ? "#ef4444" : "#dfe5ef" }}
            onFocus={() => setIsFocused({ ...isFocused, name: true })}
            onBlur={() => setIsFocused({ ...isFocused, name: false })}
          />
          <label
            className={`absolute left-2 transition-all duration-200 pointer-events-none ${
              isFocused.name || name ? "text-sm -top-2 text-[#5d87ff] bg-white px-1" : "top-3 text-gray-500"
            }`}
          >
            Name
          </label>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <FaExclamationCircle className="mr-1" /> {errors.name}
            </p>
          )} {/* Error message with icon */}
        </div>
        <div className="w-full mb-2 sm:mb-4 relative">
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
          <input
            type="text"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErrors({ ...errors, phone: "" }); // Clear error on change
            }}
            className={`w-full p-3 text-gray-900 bg-white border-2 rounded-lg focus:outline-none peer ${
              errors.phone ? "border-red-500" : ""
            }`}
            style={{ borderColor: isFocused.phone ? "#5d87ff" : errors.phone ? "#ef4444" : "#dfe5ef" }}
            onFocus={() => setIsFocused({ ...isFocused, phone: true })}
            onBlur={() => setIsFocused({ ...isFocused, phone: false })}
          />
          <label
            className={`absolute left-2 transition-all duration-200 pointer-events-none ${
              isFocused.phone || phone ? "text-sm -top-2 text-[#5d87ff] bg-white px-1" : "top-3 text-gray-500"
            }`}
          >
            Phone Number
          </label>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <FaExclamationCircle className="mr-1" /> {errors.phone}
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
        <button
          onClick={handleRegister}
          className="w-full bg-[#5d87ff] text-white p-2 sm:p-3 rounded-lg hover:bg-[#4570ea]"
        >
          Sign Up
        </button>
        <p className="text-center text-gray-500 font-light mt-2 sm:mt-4 text-sm sm:text-base">
          Already have an account?{" "}
          <Link href="/login" className="text-[#5d87ff]">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}