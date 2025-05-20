"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export default function ContactPage() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#101b35] text-white flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col lg:flex-row items-start justify-between px-4 sm:px-6 md:px-12 py-8 sm:py-12">
          {/* Image at the top */}
          <div className="w-full lg:w-2/3 flex justify-center pb-8 sm:pb-12">
            <Image
              src="/images/contact.jpg"
              alt="About PrepInterview"
              width={750} // Reduced for mobile
              height={500} // Reduced for mobile
              className="rounded-lg shadow-lg object-cover"
            />
          </div>
          {/* Text content below image on mobile, beside on lg+ */}
          <div className="w-full lg:w-1/3 text-center lg:text-left mt-4 sm:mt-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Contact Us</h1>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-300">
              We’d love to hear from you! Reach out to us for support, feedback, or inquiries.
            </p>
            <p className="text-sm sm:text-base md:text-lg mt-4 sm:mt-6 text-gray-300">
              Email: ashishshetty139@gmail.com<br />
              Phone: +916354373245<br />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}