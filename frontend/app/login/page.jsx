"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"; // Use environment variable

export default function LoginPage() {
  // Fixed component name from RegisterPage to LoginPage
  const router = useRouter();
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      // Use API_URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
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
        <h2 className="text-2xl font-bold text-black mb-6">Login</h2>

        {/* Google & Facebook in One Row */}
        <div className="flex w-full gap-4 mb-6">
          <button className="w-1/2 flex items-center justify-center gap-2 p-3 bg-white text-black font-light border border-gray-200  rounded-lg">
            <Image
              src="/svgs/google-icon.svg"
              alt="Google"
              width={15}
              height={15}
            />
            <span>Sign in with Google</span>
          </button>
          <button className="w-1/2 flex items-center justify-center bg-white pr-8 text-black font-light border border-gray-200 rounded-lg">
            <Image
              src="/svgs/facebook-icon.svg"
              alt="Facebook"
              width={40}
              height={40}
            />
            <span>Sign in with FB </span>
          </button>
        </div>

        {/* Centered "or sign in with" with Lines */}
        <div className="flex items-center w-full mb-4">
          <div className="flex-grow h-[1px] bg-gray-300 "></div>
          <span className="px-4 text-gray-600 font-light">or sign in with</span>
          <div className="flex-grow h-[1px] bg-gray-300 "></div>
        </div>

        {/* Input Fields with Labels */}
        <div className="w-full mb-3">
          <label className="block text-black mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 text-gray-900 bg-white  border-2 rounded-lg focus:outline-none"
            style={{ borderColor: isFocused.email ? "#5d87ff" : "#dfe5ef" }}
            onFocus={() => setIsFocused({ ...isFocused, email: true })}
            onBlur={() => setIsFocused({ ...isFocused, email: false })}
          />
        </div>

        <div className="w-full mb-4">
          <label className="block text-black mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 text-gray-900 bg-white  border-2 rounded-lg focus:outline-none"
            style={{ borderColor: isFocused.password ? "#5d87ff" : "#dfe5ef" }}
            onFocus={() => setIsFocused({ ...isFocused, password: true })}
            onBlur={() => setIsFocused({ ...isFocused, password: false })}
          />
        </div>

        <div className="flex justify-between items-center mb-4 w-full">
          <label className="flex items-center text-gray-600 font-light">
            <input type="checkbox" className="mr-2" /> Remember this Device
          </label>
          <a href="#" className="text-[#5d87ff]">
            Forgot Password?
          </a>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-[#5d87ff] text-white p-3 rounded-lg hover:bg-[#4570ea]"
        >
          Sign In
        </button>

        <p className="text-center text-gray-600 font-light mt-4">
          Don't have an Account?{" "}
          <a href="/register" className="text-[#5d87ff]">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

// "use client";

// import Image from "next/image";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"; // Use environment variable

// export default function LoginPage() { // Fixed component name from RegisterPage to LoginPage
//   const router = useRouter();
//   const [isFocused, setIsFocused] = useState({
//     email: false,
//     password: false,
//   });

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = async () => {
//     const response = await fetch(`${API_URL}/api/auth/login`, { // Use API_URL
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ email, password }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       localStorage.setItem("token", data.token);
//       router.push("/dashboard");
//     } else {
//       alert(data.message);
//     }
//   };

//   return (
//     <div className="flex h-screen w-full">
//       {/* Left Side */}
//       <div className="hidden lg:flex w-2/3 justify-center items-center bg-[#f2f6fa]">
//         {/* <Image
//           src="/svgs/login-bg.svg"
//           alt="Login Illustration"
//           width={500}
//           height={500}
//         /> */}

//         <video
//           autoPlay
//           loop
//           muted
//           playsInline
//           className="w-full h-full object-cover"
//         >
//           <source src="/videos/interview2.mp4" type="video/mp4"/>
//           Your browser does not support the video tag.
//         </video>

//       </div>

//       {/* Right Side */}
//       <div className="w-full lg:w-1/3 flex flex-col bg-white justify-center items-center bg-gradient-to-br from-[#6a83f3e6] to-[#526de6f8] px-12">
//         <h2 className="text-2xl font-bold text-black mb-6">Login</h2>

//         {/* Google & Facebook in One Row */}
//         <div className="flex w-full gap-4 mb-6">
//           <button className="w-1/2 flex items-center justify-center gap-2 p-3 text-gray-600 font-light border border-gray-200 rounded-lg">
//             <Image
//               src="/svgs/google-icon.svg"
//               alt="Google"
//               width={15}
//               height={15}
//             />
//             Sign in with Google
//           </button>
//           <button className="w-1/2 flex items-center justify-center pr-8 text-gray-600 font-light border border-gray-200 rounded-lg">
//             <Image
//               src="/svgs/facebook-icon.svg"
//               alt="Facebook"
//               width={40}
//               height={40}
//             />
//             Sign in with FB
//           </button>
//         </div>

//         {/* Centered "or sign in with" with Lines */}
//         <div className="flex items-center w-full mb-4">
//           <div className="flex-grow h-[1px] bg-gray-300"></div>
//           <span className="px-4 text-gray-600 font-light">or sign in with</span>
//           <div className="flex-grow h-[1px] bg-gray-300"></div>
//         </div>

//         {/* Input Fields with Labels */}
//         <div className="w-full mb-3">
//           <label className="block text-black mb-1">Email</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full p-2 text-gray-900 border-2 rounded-lg focus:outline-none"
//             style={{ borderColor: isFocused.email ? "#5d87ff" : "#dfe5ef" }}
//             onFocus={() => setIsFocused({ ...isFocused, email: true })}
//             onBlur={() => setIsFocused({ ...isFocused, email: false })}
//           />
//         </div>

//         <div className="w-full mb-4">
//           <label className="block text-black mb-1">Password</label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-2 text-gray-900 border-2 rounded-lg focus:outline-none"
//             style={{ borderColor: isFocused.password ? "#5d87ff" : "#dfe5ef" }}
//             onFocus={() => setIsFocused({ ...isFocused, password: true })}
//             onBlur={() => setIsFocused({ ...isFocused, password: false })}
//           />
//         </div>

//         <div className="flex justify-between items-center mb-4 w-full">
//           <label className="flex items-center text-gray-600 font-light">
//             <input type="checkbox" className="mr-2" /> Remember this Device
//           </label>
//           <a href="#" className="text-[#5d87ff]">Forgot Password?</a>
//         </div>

//         {/* Sign In Button */}
//         <button
//           onClick={handleLogin}
//           className="w-full bg-[#5d87ff] text-white p-3 rounded-lg hover:bg-[#4570ea]"
//         >
//           Sign In
//         </button>

//         <p className="text-center text-gray-600 font-light mt-4">
//           Don't have an Account?{" "}
//           <a href="/register" className="text-[#5d87ff]">Sign Up</a>
//         </p>
//       </div>
//     </div>
//   );
// }
