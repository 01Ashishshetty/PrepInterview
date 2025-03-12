"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RegisterPage() {
  const router = useRouter();
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleregister = async () => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, phone, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Registration successful! Please login.");
      router.push("/login");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left Side */}
      <div className="hidden lg:flex w-2/3 justify-center items-center bg-[#f2f6fa]">
        {/* <Image
          src="/svgs/login-bg.svg"
          alt="Login Illustration"
          width={500}
          height={500}
        /> */}

        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/interview2.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white justify-center items-center px-12">
        <h2 className="text-2xl font-bold text-black mb-6">Sign Up</h2>

        {/* Google & Facebook in One Row */}
        <div className="flex w-full gap-4 mb-6">
          <button className="w-1/2 flex items-center justify-center gap-2 p-3 bg-white text-black font-light border border-gray-200 rounded-lg">
            <Image
              src="/svgs/google-icon.svg"
              alt="Google"
              width={15}
              height={15}
            />
            Sign up with Google
          </button>
          <button className="w-1/2 flex items-center justify-center pr-8 bg-white text-black font-light border border-gray-200 rounded-lg">
            <Image
              src="/svgs/facebook-icon.svg"
              alt="Facebook"
              width={40}
              height={40}
            />
            Sign up with FB
          </button>
        </div>

        {/* Centered "or sign up with" with Lines */}
        <div className="flex items-center w-full mb-4">
          <div className="flex-grow h-[1px] bg-gray-300"></div>
          <span className="px-4 text-gray-600 font-light">or sign up with</span>
          <div className="flex-grow h-[1px] bg-gray-300"></div>
        </div>

        {/* Input Fields */}
        <div className="w-full mb-3">
          <label className="block text-black mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 text-gray-900 bg-white border-2 rounded-lg focus:outline-none"
            style={{ borderColor: isFocused.name ? "#5d87ff" : "#dfe5ef" }}
            onFocus={() => setIsFocused({ ...isFocused, name: true })}
            onBlur={() => setIsFocused({ ...isFocused, name: false })}
          />
        </div>

        <div className="w-full mb-3">
          <label className="block text-black mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 text-gray-900 bg-white border-2 rounded-lg focus:outline-none"
            style={{ borderColor: isFocused.email ? "#5d87ff" : "#dfe5ef" }}
            onFocus={() => setIsFocused({ ...isFocused, email: true })}
            onBlur={() => setIsFocused({ ...isFocused, email: false })}
          />
        </div>

        <div className="w-full mb-3">
          <label className="block text-black mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 text-gray-900 bg-white border-2 rounded-lg focus:outline-none"
            style={{ borderColor: isFocused.phone ? "#5d87ff" : "#dfe5ef" }}
            onFocus={() => setIsFocused({ ...isFocused, phone: true })}
            onBlur={() => setIsFocused({ ...isFocused, phone: false })}
          />
        </div>

        <div className="w-full mb-3">
          <label className="block text-black mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 text-gray-900 bg-white border-2 rounded-lg focus:outline-none"
            style={{ borderColor: isFocused.password ? "#5d87ff" : "#dfe5ef" }}
            onFocus={() => setIsFocused({ ...isFocused, password: true })}
            onBlur={() => setIsFocused({ ...isFocused, password: false })}
          />
        </div>

        {/* Terms & Conditions Checkbox */}
        <div className="flex items-center w-full mb-4">
          <input type="checkbox" className="mr-2" />
          <label className="text-gray-600 font-light">
            I agree to the{" "}
            <a href="#" className="text-[#5d87ff]">
              Terms & Conditions
            </a>
          </label>
        </div>

        {/* Sign Up Button with Custom Hover Color */}
        <button
          onClick={handleregister}
          className="w-full bg-[#5d87ff] text-white p-3 rounded-lg hover:bg-[#4570ea]"
        >
          Sign Up
        </button>

        <p className="text-center text-gray-600 font-light mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-[#5d87ff]">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
