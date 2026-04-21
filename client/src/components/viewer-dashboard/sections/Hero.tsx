import backgroundImage from "../../../assets/backgroundImage.jpg";

type HeroProps = {
  currentYear: number;
};

export default function Hero({ currentYear }: HeroProps) {
  return (
    <div className="relative flex items-center justify-center min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 overflow-hidden">

      {/* 🔹 TOP BACKGROUND IMAGE */}
      <div
        className="absolute top-14 left-0 w-full h-[35vh] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* 🔹 OVERLAY (LIGHT + DARK MODE) */}
      <div className="absolute top-14 left-0 w-full h-[35vh] bg-black/40 dark:bg-black/60 backdrop-blur-[1px]" />

      {/* 🔹 FADE INTO CONTENT (LIGHT + DARK) */}
      <div className="absolute top-[35vh] left-0 w-full h-20 
        bg-gradient-to-b from-transparent to-white 
        dark:to-[hsl(var(--background))]" 
      />

      {/* 🔹 CONTENT */}
      <div className="relative text-center animate-fadeInUp mt-32 sm:mt-64">

        <h1 className="font-extrabold mb-4 sm:mb-6 leading-tight">

          {/* Main Title */}
          <span className="block text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2">
            Barangay San Agustin
          </span>

          {/* Gradient Title */}
          <span className="text-transparent bg-clip-text 
            bg-gradient-to-r from-blue-600 to-blue-400 
            dark:from-blue-400 dark:to-purple-400
            text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            FundSight System
          </span>

        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl 
          text-slate-600 dark:text-slate-300 
          max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto 
          leading-relaxed font-medium px-2">
          
          Advancing transparency and good governance in Iba, Zambales through{" "}
          
          <span className="text-blue-600 dark:text-blue-400 font-semibold">
            accurate reporting
          </span>,
          
          real-time data access, and accountable financial management.
        </p>

      </div>
    </div>
  );
}