"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaEye, FaEyeSlash} from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [isFocused, setIsFocused] = useState({
    email: false,
    otp: false,
    newPassword: false,
  });
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [notification, setNotification] = useState({ visible: false });
  const router = useRouter();

  const sendOtp = async () => {
    const response = await fetch(`${API_URL}/api/otp/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (response.ok) setStep(2);
    else alert(data.message);
  };

  const verifyOtp = async () => {
    const response = await fetch(`${API_URL}/api/otp/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    if (response.ok) setStep(3);
    else alert(data.message);
  };

  const resetPassword = async () => {
    const response = await fetch(`${API_URL}/api/otp/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await response.json();
    if (response.ok) {
      setNotification({ visible: true });
    } else {
      alert(data.message);
    }
  };

  const getStepImage = () => {
    switch (step) {
      case 1:
        return "/images/forget.png";
      case 2:
        return "/images/otp.png";
      case 3:
        return "/images/reset.png";
      default:
        return "/images/forget.png";
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-[#8ea3ff] relative">
      <Link href="/">
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 cursor-pointer">
          <Image src="/images/interv1-removebg.png" alt="PrepInterview Logo" width={250} height={50} />
        </div>
      </Link>

      <div className="w-[300px] sm:w-[400px] bg-white p-4 sm:p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="mb-2 sm:mb-4">
          <Image
            src={getStepImage()}
            alt={`Step ${step} Image`}
            width={100}
            height={100}
            className="object-contain"
          />
        </div>

        {step === 1 && (
          <div className="w-full">
            <h2 className="text-xl sm:text-2xl text-black font-bold mb-2 sm:mb-4 text-center">Forgot Password?</h2>
            <div className="w-full mb-2 sm:mb-4 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 text-gray-900 bg-white border-2 rounded-lg focus:outline-none peer"
                style={{ borderColor: isFocused.email ? "#5d87ff" : "#dfe5ef" }}
                onFocus={() => setIsFocused({ ...isFocused, email: true })}
                onBlur={() => setIsFocused({ ...isFocused, email: false })}
              />
              <label
                className={`absolute left-2 transition-all duration-200 pointer-events-none ${
                  (isFocused.email || email) ? "text-sm -top-2 text-[#5d87ff] bg-white px-1" : "top-3 text-gray-500"
                }`}
              >
                Email
              </label>
            </div>
            <button onClick={sendOtp} className="w-full bg-[#5d87ff] text-white p-2 sm:p-3 rounded-lg hover:bg-[#4570ea] mb-2 sm:mb-3">
              Send OTP
            </button>
            <Link href="/login" className="w-full text-center">
              <button className="w-full bg-[#5d87ff] text-white p-2 sm:p-3 rounded-lg hover:bg-[#4570ea]">
                Back to Login
              </button>
            </Link>
          </div>
        )}

        {step === 2 && (
          <div className="w-full">
            <h2 className="text-xl sm:text-2xl text-black font-bold mb-2 sm:mb-4 text-center">Enter OTP</h2>
            <div className="w-full mb-2 sm:mb-4 relative">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 text-gray-900 bg-white border-2 rounded-lg focus:outline-none peer"
                style={{ borderColor: isFocused.otp ? "#5d87ff" : "#dfe5ef" }}
                onFocus={() => setIsFocused({ ...isFocused, otp: true })}
                onBlur={() => setIsFocused({ ...isFocused, otp: false })}
              />
              <label
                className={`absolute left-2 transition-all duration-200 pointer-events-none ${
                  (isFocused.otp || otp) ? "text-sm -top-2 text-[#5d87ff] bg-white px-1" : "top-3 text-gray-500"
                }`}
              >
                OTP
              </label>
            </div>
            <button onClick={verifyOtp} className="w-full bg-[#5d87ff] text-white p-2 sm:p-3 rounded-lg hover:bg-[#4570ea]">
              Verify OTP
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="w-full">
            <h2 className="text-xl sm:text-2xl text-black font-bold mb-2 sm:mb-4 text-center">Reset Password</h2>
            <div className="w-full mb-2 sm:mb-4 relative">
              <div className="flex items-center border-2 rounded-lg" style={{ borderColor: isFocused.newPassword ? "#5d87ff" : "#dfe5ef" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 text-gray-900 bg-white rounded-lg focus:outline-none peer"
                  onFocus={() => setIsFocused({ ...isFocused, newPassword: true })}
                  onBlur={() => setIsFocused({ ...isFocused, newPassword: false })}
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
                  (isFocused.newPassword || newPassword) ? "text-sm -top-2 text-[#5d87ff] bg-white px-1" : "top-3 text-gray-500"
                }`}
              >
                New Password
              </label>
            </div>
            <button onClick={resetPassword} className="w-full bg-[#5d87ff] text-white p-2 sm:p-3 rounded-lg hover:bg-[#4570ea]">
              Reset Password
            </button>
          </div>
        )}
      </div>

      {notification.visible && (
        <div className="fixed inset-0 flex justify-center items-center bg-[#8ea3ff] bg-opacity-50 z-50">
          <div className="w-[300px] sm:w-[400px] bg-white p-4 sm:p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="mb-2 sm:mb-4">
              <Image
                src="/images/success.jpg"
                alt="Success Checkmark"
                width={150}
                height={40}
                className="object-contain"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">Successful</h2>
            <p className="text-sm sm:text-base text-gray-600 text-center mb-2 sm:mb-4">Password reset successful. Please log in.</p>
            <button
              onClick={() => router.push("/login")}
              className="bg-green-500 text-white px-4 sm:px-6 py-1 sm:py-2 rounded-full hover:bg-green-600 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}