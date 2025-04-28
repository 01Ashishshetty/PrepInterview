"use client";

import { useRouter, usePathname } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();

  const handleStart = () => {
    const isLoggedIn = localStorage.getItem("userLoggedIn");
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="h-screen bg-[#101b35] flex flex-col overflow-hidden relative">
      <div className="flex-1 flex flex-col sm:flex-row justify-center items-center px-4 sm:px-6 md:px-8 lg:px-12" style={{ height: "calc(100vh - 60px)" }}>
        {/* Video at the top on mobile, left on sm+ */}
        <div className="w-full sm:w-1/2 flex justify-center">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-h-[60vh] rounded-lg shadow-lg object-contain"
            style={{ maxHeight: "60vh" }}
          >
            <source src="/videos/inter2.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        {/* Text below video on mobile, right on sm+ */}
        <div className="w-full sm:w-1/2 text-white flex flex-col items-end justify-center p-2 sm:p-4 mt-4 sm:mt-0">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-right overflow-hidden">
            Master Your Interviews Anytime, Anywhere!
          </h2>
          <button
            onClick={handleStart}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-[#27366a] text-white font-semibold rounded-lg hover:bg-[#15265f]"
          >
            Let's Start
          </button>
        </div>
      </div>
    </div>
  );
}