// "use client";

// import Image from "next/image";
// import { usePathname } from "next/navigation";

// export default function AboutPage() {
//   const pathname = usePathname(); // Get current route

//   return (
//     <div className="min-h-screen bg-[#101b35] text-white flex flex-col">
//       {/* Fixed Navbar will be handled by layout.tsx */}
//       <div className="flex-1 overflow-auto"> {/* Scrollable content only if needed */}
//         {/* Main Content */}
//         <div className="flex flex-col lg:flex-row items-center justify-between px-12 py-16">
//           {/* Image Section */}
//           <div className="lg:w-2/3 w-full flex justify-center pb-50">
//             <Image
//               src="/svgs/about.svg"
//               alt="About PrepInterview"
//               width={750}
//               height={500}
//               className="rounded-lg shadow-lg object-cover"
//             />
//           </div>

//           {/* Text Content */}
//           <div className="lg:w-1/3 w-full text-center lg:text-left mt-6 lg:mt-0">
//             <h1 className="text-5xl font-bold mb-6">Empowering Your Interview Success</h1>
//             <p className="text-lg leading-relaxed text-gray-300">
//               PrepInterview is an advanced AI-driven platform designed to enhance interview 
//               performance through real-time behavioral analysis. Our cutting-edge technology 
//               evaluates eye contact, emotion recognition, and speech patterns to provide 
//               actionable feedback that helps you stand out in any interview.
//             </p>

//             <h2 className="text-2xl font-semibold mt-6 text-[#f8c555]">Why Choose PrepInterview?</h2>
//             <ul className="list-disc text-lg pl-5 mt-4 space-y-2">
//               <li><b>AI-Powered Insights:</b> Immediate feedback on eye contact, emotions, and speech clarity.</li>
//               <li><b>Personalized Learning:</b> Tailored feedback to refine your confidence and communication.</li>
//               <li><b>Data-Driven Progress:</b> Track improvements through detailed analytics and reports.</li>
//               <li><b>Real-World Simulations:</b> Practice with interactive, interview-like environments.</li>
//             </ul>

//             <p className="text-lg mt-6 text-gray-300">
//               Whether you're preparing for job interviews, university admissions, or professional presentations, 
//               PrepInterview equips you with the skills and confidence to excel in any setting.
//             </p>
//             {/* Add more content to test scroll behavior */}
//             <p className="text-lg mt-6 text-gray-300">
//               Additional content to test scrolling. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
//               Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
//               quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }






























"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export default function AboutPage() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#101b35] text-white flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col lg:flex-row items-start justify-between px-4 sm:px-6 md:px-12 py-8 sm:py-12">
          {/* Image at the top */}
          <div className="w-full lg:w-2/3 flex justify-center pb-8 sm:pb-12">
            <Image
              src="/svgs/about.svg"
              alt="About PrepInterview"
              width={750} // Reduced for mobile
              height={500} // Reduced for mobile
              className="rounded-lg shadow-lg object-cover"
            />
          </div>
          {/* Text content below image on mobile, beside on lg+ */}
          <div className="w-full lg:w-1/3 text-center lg:text-left mt-4 sm:mt-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Empowering Your Interview Success</h1>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-300">
              PrepInterview is an advanced AI-driven platform designed to enhance interview 
              performance through real-time behavioral analysis. Our cutting-edge technology 
              evaluates eye contact, emotion recognition, and speech patterns to provide 
              actionable feedback that helps you stand out in any interview.
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold mt-4 sm:mt-6 text-[#f8c555]">Why Choose PrepInterview?</h2>
            <ul className="list-disc text-sm sm:text-base md:text-lg pl-2 sm:pl-5 mt-2 sm:mt-4 space-y-1 sm:space-y-2">
              <li><b>AI-Powered Insights:</b> Immediate feedback on eye contact, emotions, and speech clarity.</li>
              <li><b>Personalized Learning:</b> Tailored feedback to refine your confidence and communication.</li>
              <li><b>Data-Driven Progress:</b> Track improvements through detailed analytics and reports.</li>
              <li><b>Real-World Simulations:</b> Practice with interactive, interview-like environments.</li>
            </ul>
            <p className="text-sm sm:text-base md:text-lg mt-4 sm:mt-6 text-gray-300">
              Whether you're preparing for job interviews, university admissions, or professional presentations, 
              PrepInterview equips you with the skills and confidence to excel in any setting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}