import { Activity, Shield, FileText, CheckCircle2 } from "lucide-react";

type FooterProps = {
  currentYear: number;
};

export default function Footer({ currentYear }: FooterProps) {
  return (
    <footer className="relative mt-12 sm:mt-16 lg:mt-20 overflow-hidden">
      <div className="absolute inset-0 glass-card-dark" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-500 rounded-full mix-blend-multiply blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-violet-500 rounded-full mix-blend-multiply blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10 lg:mb-12">
          <div className="sm:col-span-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black gradient-text">
              FundSight
            </h1>
            <h3 className="text-xl sm:text-2xl lg:text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Transparency Portal
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4 sm:mb-6 max-w-md">
              Building trust through complete financial transparency and accountability.
              Empowering our community with real-time access to public finances.
            </p>

          </div>

          <div>
            <h4 className="font-semibold sm:font-bold mb-2 sm:mb-4 text-white text-base sm:text-lg">
              Contact
            </h4>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-3 sm:mb-4">
              Visit the Barangay Hall during office hours for inquiries and concerns.
            </p>
            <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 max-w-xs">
              <p className="text-xs text-slate-400 mb-1">Office Hours</p>
              <p className="text-sm text-white font-semibold">
                Mon - Fri, 8:00 AM - 5:00 PM
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 sm:pt-6 lg:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-slate-400">
            © {currentYear} Barangay Financial Transparency Portal.
          </p>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 flex-wrap justify-center sm:justify-end">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Verified
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-600 hidden sm:block" />
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-blue-400" />
              Secure
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}