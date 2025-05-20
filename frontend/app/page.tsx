"use client";

import { useRouter, usePathname } from "next/navigation";
import Head from "next/head";

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
    <>
      <Head>
        <title>PrepInterview</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Head>
      <div className="h-screen bg-[#101b35] flex flex-col overflow-hidden relative">
        <div className="flex-1 flex flex-col sm:flex-row justify-center items-center px-4 sm:px-6 md:px-8 lg:px-12" style={{ height: "calc(100vh - 60px)" }}>
          
          {/* Text below video on mobile, right on sm+ */}
          <div className="w-full sm:w-1/2 text-white flex flex-col items-start justify-center p-2 sm:p-4 mt-4 sm:mt-0 order-2 sm:order-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-left">
              Master Your Interviews Anytime, Anywhere!
            </h2>
            <button
              onClick={handleStart}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-[#27366a] font-semibold rounded-lg hover:bg-[#dde0ff] transition-colors duration-200"
              aria-label="Start the interview preparation process"
            >
              Let's Start
            </button>
          </div>
          
          {/* Video at the top on mobile, left on sm+ */}
          <div className="w-full sm:w-1/2 flex justify-center order-1 sm:order-2">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full max-h-[50vh] sm:max-h-[60vh] rounded-lg shadow-lg object-contain"
              style={{ maxHeight: "60vh" }}
            >
              <source src="/videos/inter2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </>
  );
}