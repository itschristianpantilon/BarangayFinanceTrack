import { LogIn } from "lucide-react";
import { useLocation } from "wouter";
import logoPath from "../../assets/san_agustin.jpg";

export default function Header() {
  const [, navigate] = useLocation();

  return (
    <header className="fixed w-full h-20 z-10 backdrop-blur-md bg-white/40 flex items-center justify-between px-6 sm:px-12 lg:px-20 shadow">
      {/* <h1 className="text-xl sm:text-2xl font-black gradient-text">FundSight</h1> */}
      <div>
        <img 
            src={logoPath} 
            alt="san_agustin_logo"
            className="w-16 h-16"
            />
      </div>
      <button
        onClick={() => navigate("/login")}
        className="group px-5 bg-blue-600 sm:px-7 py-1.5 sm:py-2 rounded-lg 
                  border-2 border-blue-600 font-semibold sm:font-bold 
                  text-base sm:text-lg hover:bg-blue-50 transition-all duration-300 
                  shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transform hover:-translate-y-1 text-white hover:text-blue-700"
      >
        <span className="flex items-center justify-center gap-2">
          <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-blue-700 transition-colors duration-300" />
          Login
        </span>
      </button>
    </header>
  );
}