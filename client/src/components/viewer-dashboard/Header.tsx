import { LogIn } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import logoPath from "../../assets/san_agustin.jpg";

export default function Header() {
  const [, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const scrollContainer = document.getElementById("scroll-container");

    if (!scrollContainer) return;

    const handleScroll = () => {
      const hero = document.getElementById("hero");
      if (!hero) return;

      const rect = hero.getBoundingClientRect();

      setScrolled(rect.bottom <= 80);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed w-full h-14 lg:h-20 z-50 backdrop-blur-md bg-white/40 flex items-center px-4 sm:px-12 lg:px-20 shadow transition-all duration-300">

      {/* LEFT */}
      <div className="flex-1">
        <div
          className={`flex items-center gap-3 transition-all duration-500 ${
            scrolled
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <img
            src={logoPath}
            alt="logo"
            className="w-10 h-10 lg:w-14 lg:h-14 rounded-full object-cover border border-gray-300 shadow"
          />
        </div>
      </div>

      {/* 🔹 LOGIN BUTTON */}
      <button
        onClick={() => navigate("/login")}
        className="group px-5 bg-blue-600 sm:px-7 py-1 sm:py-2 rounded-lg 
                  border-2 border-blue-600 font-semibold sm:font-bold 
                  text-base sm:text-lg hover:bg-blue-50 transition-all duration-300 
                  shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transform hover:-translate-y-1 text-white hover:text-blue-700"
      >
        <span className="flex items-center justify-center gap-2 text-xs sm:text-sm px-1">
          <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-blue-700 transition-colors duration-300" />
          Login
        </span>
      </button>
    </header>
  );
}