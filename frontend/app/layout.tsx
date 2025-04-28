"use client";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { FaCog, FaSignOutAlt, FaTimes, FaBars } from "react-icons/fa";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>("ashishshetty123@gmail.com");
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ right: 0, top: 0 });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // State for sidebar
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("userName");
      const email = localStorage.getItem("userEmail");
      const phone = localStorage.getItem("userPhone");
      setUserName(name);
      setUserEmail(email || "ashishshetty123@gmail.com");
      setUserPhone(phone || "123-456-7890");
    }

    const navElement = document.querySelector('nav');
    if (navElement) {
      const rect = navElement.getBoundingClientRect();
      setDropdownPosition({
        right: window.innerWidth - rect.right,
        top: rect.bottom,
      });
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      // Safe check for sidebar element
      const sidebar = document.querySelector('.sidebar');
      if (showSidebar && sidebar && !sidebar.contains(event.target as Node)) {
        setShowSidebar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pathname, showSidebar]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userPhone");
      localStorage.removeItem("userLoggedIn");
    }
    setUserName(null);
    setUserEmail(null);
    setUserPhone(null);
    setShowDropdown(false);
    router.push("/");
  };

  const handleDetails = () => {
    setShowSettingsModal(true);
    setShowDropdown(false);
  };

  const handleClick = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const showNavbar = pathname !== "/login" && pathname !== "/register" && pathname !== "/forgot-password" && pathname !== "/dashboard";

  return (
    <html lang="en">
      <body className="bg-gray-100">
        {showNavbar && (
          <nav className="w-full flex justify-between items-center px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-[#15265f] shadow-md fixed top-0 left-0 z-50" style={{ height: "60px" }}>
            <Link href="/">
              <Image src="/images/interv-removebg.png" alt="Logo" width={150} height={40} className="cursor-pointer" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Hamburger menu for mobile */}
              <button onClick={toggleSidebar} className="lg:hidden text-white text-2xl">
                <FaBars />
              </button>
              {/* Navigation links for desktop */}
              <div className="hidden lg:flex gap-4 items-center">
                {[
                  { name: "Home", path: "/" },
                  { name: "About", path: "/about" },
                  { name: "Contact", path: "/contact" },
                ].map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-2 sm:px-3 py-1 sm:py-2 rounded-md transition text-sm sm:text-base ${
                      pathname === item.path
                        ? "bg-blue-900 text-white border-b-4 border-blue-400"
                        : "text-white hover:text-gray-300"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              {userName ? (
                <div className="relative inline-flex items-center">
                  <div onClick={handleClick} className="flex items-center cursor-pointer">
                    <Image src="/images/user-1.jpg" alt="User Icon" width={25} height={25} className="mr-1 sm:mr-2 rounded-lg" />
                    <span
                      className={`px-1 py-1 sm:px-1 sm:py-2 rounded-md transition text-sm sm:text-base ${
                        pathname === "/dashboard"
                          ? "bg-blue-900 text-white border-b-4 border-blue-400"
                          : "text-white hover:text-gray-300"
                      }`}
                    >
                      {userName}
                    </span>
                  </div>
                  {showDropdown && (
                    <div
                      ref={dropdownRef}
                      className="fixed bg-[#15265f] text-xs sm:text-sm mt-1 p-1 rounded-xl shadow-lg z-20"
                      style={{
                        top: `${dropdownPosition.top}px`,
                        right: `${dropdownPosition.right}px`,
                        width: "100px sm:120px",
                      }}
                    >
                      <button
                        onClick={handleDetails}
                        className="w-full text-left px-2 sm:px-4 py-1 sm:py-2 text-white rounded-md transition hover:bg-blue-900 flex items-center"
                      >
                        <FaCog className="mr-1 sm:mr-2" /> Account
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-2 sm:px-4 py-1 sm:py-2 text-white rounded-md transition hover:bg-blue-900 flex items-center"
                      >
                        <FaSignOutAlt className="mr-1 sm:mr-2" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`hidden lg:block px-2 sm:px-3 py-1 sm:py-2 rounded-md transition text-sm sm:text-base ${
                    pathname === "/login"
                      ? "bg-blue-900 text-white border-b-4 border-blue-400"
                      : "text-white hover:text-gray-300"
                  }`}
                >
                  Login
                </Link>
              )}
            </div>
          </nav>
        )}
        {/* Sidebar for mobile menu */}
        <div
          className={`fixed top-0 left-0 w-50 bg-[#15265f] text-center text-white h-full z-50 transform ${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out lg:hidden sidebar`}
        >
          <button
            onClick={toggleSidebar}
            className="absolute top-4 right-4 text-white"
          >
            <FaTimes className="w-6 h-6" />
          </button>
          <div className="mt-16 p-4 space-y-4">
            {[
              { name: "Home", path: "/" },
              { name: "About", path: "/about" },
              { name: "Contact", path: "/contact" },
              { name: "Login", path: "/login" },
            ].map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`block px-4 py-2 rounded-md transition text-base ${
                  pathname === item.path
                    ? "bg-blue-900 text-white"
                    : "text-white hover:bg-blue-700"
                }`}
                onClick={() => setShowSidebar(false)} // Close sidebar on link click
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className={showNavbar ? "pt-[60px] min-h-screen" : "min-h-screen"}>{children}</div>
        {showSettingsModal && (
          <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-30">
            <div className="bg-[#15265f] bg-opacity-80 backdrop-blur-md p-4 sm:p-6 rounded-lg shadow-lg w-64 sm:w-80 relative">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-center">Account</h2>
              <div className="space-y-2 sm:space-y-4">
                <div>
                  <p className="text-gray-400 text-xs sm:text-base">Name</p>
                  <p className="text-sm sm:text-base">{userName || "Ashish Shetty"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-base">Email</p>
                  <p className="text-sm sm:text-base">{userEmail || "ashishshetty123@gmail.com"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-base">Phone</p>
                  <p className="text-sm sm:text-base">{userPhone || "123-456-7890"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}