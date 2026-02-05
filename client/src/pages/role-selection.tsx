import { useState, type KeyboardEvent } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  FileEdit, CheckCircle, UserCheck, ClipboardCheck, Eye, Shield, MapPin 
} from "lucide-react";
import logoPath from "../assets/san_agustin.jpg";
import barangayHallPath from "../assets/backgroundImage.jpg";

const roles = [
  { id: "admin", title: "Admin", description: "System governance, user management, and full audit logs.", icon: Shield, borderColor: "border-blue-500", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  { id: "encoder", title: "Encoder", description: "Entry and management of daily financial transactions.", icon: FileEdit, borderColor: "border-emerald-500", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { id: "checker", title: "Checker", description: "Validation and verification of encoded financial data.", icon: CheckCircle, borderColor: "border-amber-500", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  { id: "approver", title: "Approver", description: "Final authorization of pending financial documents.", icon: UserCheck, borderColor: "border-purple-500", iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  { id: "reviewer", title: "Reviewer", description: "Comprehensive auditing and performance reviews.", icon: ClipboardCheck, borderColor: "border-rose-500", iconBg: "bg-rose-50", iconColor: "text-rose-600" },
];

export default function RoleSelection() {
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    localStorage.setItem("userRole", roleId);
    setTimeout(() => {
      setLocation(roleId === "admin" ? "/login" : `/${roleId}/dashboard`);
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc]">
      {/* --- HERO SECTION --- */}
      <div className="relative h-[300px] w-full overflow-hidden bg-slate-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url(${barangayHallPath})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f8fafc]" />
        
        <div className="relative h-full max-w-7xl mx-auto flex items-center px-6 md:px-12">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 flex items-center gap-6">
            <div className="relative">
               <img src={logoPath} alt="Logo" className="h-20 w-20 rounded-xl shadow-md object-cover" />
               <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1 rounded-full">
                 <Shield className="w-4 h-4" />
               </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Barangay San Agustin</h1>
              <div className="flex items-center gap-2 text-slate-600 mt-1 font-medium">
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded uppercase">FinTrack v2.0</span>
                <span className="text-slate-300">|</span>
                <p className="text-sm flex items-center"><MapPin className="w-3 h-3 mr-1"/> Iba, Zambales</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- ROLE SELECTION SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 pb-20 relative z-10">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-800">Select Access Portal</h2>
          <p className="text-slate-500">Please choose your designated role to continue to the dashboard.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`group relative text-left transition-all duration-300 hover:-translate-y-1 focus:outline-none`}
              >
                <Card className={`h-full border-t-4 ${role.borderColor} transition-shadow duration-300 ${
                  isSelected ? 'shadow-2xl ring-2 ring-blue-500/20' : 'shadow-sm hover:shadow-xl'
                }`}>
                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 rounded-xl ${role.iconBg} flex items-center justify-center transition-colors group-hover:scale-110 duration-300`}>
                      <Icon className={`h-6 w-6 ${role.iconColor}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg font-bold text-slate-800 mb-2">{role.title}</CardTitle>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {role.description}
                    </p>
                    <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                      Enter Dashboard →
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        {/* --- FOOTER INFO --- */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4">
            <div className="bg-blue-100 p-2 rounded-full h-fit">
               <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-blue-800 leading-relaxed italic">
              <strong>Security Protocol:</strong> Access is logged by IP address. Your role permissions are strictly monitored. If you cannot find your role, contact the Systems Administrator in the Barangay Hall.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}