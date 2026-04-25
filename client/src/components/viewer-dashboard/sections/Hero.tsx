import backgroundImage from "../../../assets/backgroundImage.jpg";
import logoPath from "../../../assets/san_agustin.jpg";

type HeroProps = {
  currentYear: number;
};

export default function Hero({ currentYear }: HeroProps) {
  return (
    <section 
      id="hero"
      className="relative w-full h-[45vh] sm:h-[50vh] flex items-center justify-center overflow-hidden">

      {/* 🔹 BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* 🔹 DARK OVERLAY + BLUR */}
      <div className="absolute inset-0 bg-black/60" />

      {/* 🔹 CONTENT */}
      <div className="relative text-center text-white px-4">

        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 sm:w-28 sm:h-28 rounded-full bg-white/90 flex  items-center justify-center shadow-lg">
            <img src={logoPath} alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-2xl sm:text-4xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
          Barangay San Agustin
        </h1>

        {/* SUBTITLE */}
        <p className="mt-4 text-sm sm:text-base md:text-lg font-medium text-white">
          FundSight System
        </p>

        {/* LOCATION */}
        <p className="text-xs sm:text-base text-gray-300 mt-1">
          Iba, Zambales
        </p>
      </div>
    </section>
  );
}