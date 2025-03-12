"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Simulating a user check (replace with actual authentication logic)
    const user = localStorage.getItem("userRegistered");
    if (user) {
      setIsRegistered(true);
    }
  }, []);

  const handleStart = () => {
    if (isRegistered) {
      router.push("/dashboard"); // Redirect to main page after registration
    } else {
      router.push("/register"); // Redirect to registration if not registered
    }
  };

  return (
    <div className="h-screen bg-[#8ea3ff] flex flex-col">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-8 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">InterviewMaster</h1>
        <div className="flex gap-6">
          <Link href="/" className="text-gray-800 hover:text-blue-600">
            Home
          </Link>
          <Link href="/about" className="text-gray-800 hover:text-blue-600">
            About
          </Link>
          <Link href="/contact" className="text-gray-800 hover:text-blue-600">
            Contact
          </Link>
          <Link href="/login" className="text-gray-800 hover:text-blue-600">
            Login
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 justify-center items-center px-12">
        {/* Left Section - Video */}
        <div className="w-1/2 flex justify-center">
          <video autoPlay loop muted playsInline className="w-full h-auto rounded-lg shadow-lg">
            <source src="/videos/inter2.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Right Section - Slogan & Button */}
        <div className="w-1/2 text-white flex flex-col items-end">
          <h2 className="text-4xl font-bold mb-6 text-right">
            Master Your Interviews Anytime, Anywhere!
          </h2>
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-white text-blue-500 font-semibold rounded-lg hover:bg-gray-200"
          >
            Let's Start
          </button>
        </div>
      </div>
    </div>
  );
}
