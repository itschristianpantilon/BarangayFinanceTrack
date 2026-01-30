import barangayHallPath from "../assets/backgroundImage.jpg";

export function HeroBanner() {
  return (
    <div className="relative h-64 w-full overflow-hidden bg-slate-900 shadow-lg">
      {/* Background Image with a subtle zoom/scale for depth */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ 
          backgroundImage: `url(${barangayHallPath})`,
          filter: 'brightness(0.7)' 
        }}
      />
      
      {/* Soft Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
      
      {/* Content Container */}
      <div className="relative h-full max-w-7xl mx-auto flex items-center px-6 lg:px-12">
        
        {/* Glass Card */}
        <div className="bg-white/10 backdrop-blur-md border-l-4 border-blue-500 p-8 rounded-r-xl shadow-2xl max-w-xl">
          <span className="text-blue-400 font-semibold tracking-widest text-xs uppercase mb-2 block">
            Official Portal
          </span>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Barangay San Agustin
          </h1>
          
          <div className="mt-4 flex flex-col gap-1">
            <p className="text-xl text-slate-100 font-light tracking-wide">
              Financial Monitoring <span className="font-bold text-white">System</span>
            </p>
            <p className="flex items-center text-slate-300 text-sm">
              <svg className="w-4 h-4 mr-1 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Iba, Zambales
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}