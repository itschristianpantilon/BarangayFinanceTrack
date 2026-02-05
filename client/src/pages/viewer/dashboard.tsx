import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Shield, 
  BarChart3, 
  FileText, 
  Users, 
  DollarSign, 
  Activity, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  Wallet,
  PieChart as PieChartIcon,
} from "lucide-react";

import { useLocation } from "wouter";

// Import API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

// Types
export type Collection = {
  id: string;
  transactionDate: string;
  category: string;
  payor: string;
  amount: string;
  createdAt?: string;
};

export type Disbursement = {
  id: string;
  transactionDate: string;
  category: string;
  payee: string;
  amount: string;
  createdAt?: string;
};

export type DfurProject = {
  id: string;
  transactionId: string;
  transactionDate: string;
  natureOfCollection: string;
  project: string;
  location: string;
  totalCostApproved: string;
  totalCostIncurred: string;
  dateStarted: string;
  targetCompletionDate: string;
  status: "Planned" | "In Progress" | "Completed" | "On Hold" | "Cancelled";
  numberOfExtensions: number;
  remarks?: string;
  reviewStatus?: "pending" | "approved" | "flagged";
  reviewedBy?: string;
  reviewComment?: string;
};

export type CapitalOutlaySummary = {
  totals: {
    planned: number;
    actual: number;
    variance: number;
  };
  items: Array<{
    label: string;
    planned: number;
    actual: number;
    variance: number;
  }>;
};

// Consistent color palette
const COLORS = {
  primary: "#3b82f6",      // blue-500
  primaryLight: "#60a5fa", // blue-400
  primaryDark: "#2563eb",  // blue-600
  success: "#10b981",      // emerald-500
  successLight: "#34d399", // emerald-400
  successDark: "#059669",  // emerald-600
  warning: "#f59e0b",      // amber-500
  warningLight: "#fbbf24", // amber-400
  warningDark: "#d97706",  // amber-600
  danger: "#ef4444",       // red-500
  dangerLight: "#f87171",  // red-400
  dangerDark: "#dc2626",   // red-600
  purple: "#8b5cf6",       // violet-500
  purpleLight: "#a78bfa",  // violet-400
  purpleDark: "#7c3aed",   // violet-600
};

// API fetch functions
const fetchCollections = async (): Promise<Collection[]> => {
  const response = await fetch(`${API_BASE_URL}/get-collection`);
  if (!response.ok) throw new Error('Failed to fetch collections');
  const data = await response.json();
  return data;
};

const fetchDisbursements = async (): Promise<Disbursement[]> => {
  const response = await fetch(`${API_BASE_URL}/get-disbursement`);
  if (!response.ok) throw new Error('Failed to fetch disbursements');
  const data = await response.json();
  return data;
};

const fetchDfurProjects = async (): Promise<DfurProject[]> => {
  const response = await fetch(`${API_BASE_URL}/get-dfur-project`);
  if (!response.ok) throw new Error('Failed to fetch DFUR projects');
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export default function ViewerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const currentYear = new Date().getFullYear();

  const [, navigate] = useLocation();

  // Fetch data
  const { data: collections, isLoading: isLoadingCollections } = useQuery<Collection[]>({
    queryKey: ['collections'],
    queryFn: fetchCollections,
    select: (data) => {
      return [...data].sort((a, b) => {
        const dateA = a.transactionDate ? new Date(a.transactionDate).getTime() : 
                     (a.createdAt ? new Date(a.createdAt).getTime() : Date.now());
        const dateB = b.transactionDate ? new Date(b.transactionDate).getTime() : 
                     (b.createdAt ? new Date(b.createdAt).getTime() : Date.now());
        return dateB - dateA;
      });
    },
  });

  const { data: disbursements, isLoading: isLoadingDisbursements } = useQuery<Disbursement[]>({
    queryKey: ['disbursements'],
    queryFn: fetchDisbursements,
    select: (data) => {
      return [...data].sort((a, b) => {
        const dateA = a.transactionDate ? new Date(a.transactionDate).getTime() : 
                     (a.createdAt ? new Date(a.createdAt).getTime() : Date.now());
        const dateB = b.transactionDate ? new Date(b.transactionDate).getTime() : 
                     (b.createdAt ? new Date(b.createdAt).getTime() : Date.now());
        return dateB - dateA;
      });
    },
  });

  const { data: dfurProjects, isLoading: isLoadingDfurProjects } = useQuery<DfurProject[]>({
    queryKey: ['dfurProjects'],
    queryFn: fetchDfurProjects,
  });

  const { data: capitalOutlaySummary } = useQuery<CapitalOutlaySummary>({
    queryKey: ["/api/abr/capital-outlay-summary", currentYear],
  });

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatCurrencyCompact = (value: number) => {
    if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₱${(value / 1000).toFixed(0)}K`;
    return `₱${value.toFixed(0)}`;
  };

  const safeParseAmount = (amount: string | null | undefined): number => {
    if (!amount) return 0;
    const num = Number(amount);
    return isNaN(num) ? 0 : num;
  };

  // Calculations
  const totalCollections = collections?.reduce((sum, c) => sum + safeParseAmount(c.amount), 0) || 0;
  const totalDisbursements = disbursements?.reduce((sum, d) => sum + safeParseAmount(d.amount), 0) || 0;
  const surplus = totalCollections - totalDisbursements;
  const totalApprovedCost = (dfurProjects || []).reduce((sum, p) => sum + safeParseAmount(p.totalCostApproved), 0);
  const totalIncurredCost = (dfurProjects || []).reduce((sum, p) => sum + safeParseAmount(p.totalCostIncurred), 0);

  const collectionsBySource = collections?.reduce((acc, c) => {
    const source = c.category || "Other";
    acc[source] = (acc[source] || 0) + safeParseAmount(c.amount);
    return acc;
  }, {} as Record<string, number>);

  const collectionsPieData = Object.entries(collectionsBySource || {}).map(([name, value]) => ({
    name,
    value,
  })).slice(0, 5);

  const disbursementsByCategory = disbursements?.reduce((acc, d) => {
    const category = d.category || "Other";
    acc[category] = (acc[category] || 0) + safeParseAmount(d.amount);
    return acc;
  }, {} as Record<string, number>);

  const disbursementsPieData = Object.entries(disbursementsByCategory || {}).map(([name, value]) => ({
    name,
    value,
  })).slice(0, 5);

  const dfurByStatus = (dfurProjects || []).reduce((acc, p) => {
    const status = p.reviewStatus === "approved" ? "Approved" : p.reviewStatus === "flagged" ? "Flagged" : "Pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dfurStatusPieData = Object.entries(dfurByStatus || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const pieChartColors = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.purple, COLORS.danger];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-slideIn {
          animation: slideIn 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
        }

        .glass-card-dark {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .stat-card:hover::before {
          left: 100%;
        }

        .stat-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .gradient-text {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mesh-gradient {
          background: 
            radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.1) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(245, 158, 11, 0.1) 0px, transparent 50%);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
        }
      `}</style>

      {/* Hero Header */}
      <header className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-72 h-72 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center animate-fadeInUp">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-card rounded-full text-sm font-semibold mb-8 shadow-lg">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <span className="gradient-text">
                Live Transparency Portal {currentYear}
              </span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-7xl md:text-8xl font-extrabold mb-6 leading-tight">
              <span className="block text-slate-900 mb-2">Barangay</span>
              <span className="gradient-text">Financial Dashboard</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Empowering communities through <span className="text-blue-600 font-semibold">complete transparency</span>, 
              real-time data, and verified accountability.
            </p>
          </div>

          {/* Enhanced Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-6xl mx-auto">
            {[
              { 
                icon: Wallet, 
                value: formatCurrencyCompact(capitalOutlaySummary?.totals.planned || 0), 
                label: "Total Budget", 
                color: "blue"
              },
              { 
                icon: TrendingUp, 
                value: formatCurrencyCompact(totalCollections), 
                label: "Collections", 
                color: "emerald"
              },
              { 
                icon: TrendingDown, 
                value: formatCurrencyCompact(totalDisbursements), 
                label: "Disbursements", 
                color: "amber"
              },
              { 
                icon: Target, 
                value: `${dfurProjects?.length || 0}`, 
                label: "Projects", 
                color: "violet"
              },
            ].map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div 
                  key={index} 
                  className={`stat-card glass-card rounded-2xl p-6 border border-${metric.color}-200`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-${metric.color}-100 mb-4 shadow-lg`}>
                    <Icon className={`w-7 h-7 text-${metric.color}-600`} />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{metric.value}</div>
                  <div className="text-sm text-slate-600 font-semibold uppercase tracking-wider">{metric.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16 space-y-20">
        
        {/* Financial Overview Section */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-12 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-lg" />
            <div>
              <h2 className="text-4xl font-bold text-slate-900">Financial Overview</h2>
              <p className="text-slate-600 mt-1">Real-time budget tracking and utilization</p>
            </div>
          </div>

          {/* Budget Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <div className="stat-card glass-card rounded-2xl p-6 border border-blue-200">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0">Planned</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {formatCurrencyCompact(capitalOutlaySummary?.totals.planned || 0)}
              </div>
              <div className="text-sm text-slate-600 font-medium">Planned Budget</div>
            </div>

            <div className="stat-card glass-card rounded-2xl p-6 border border-emerald-200">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-0">Actual</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {formatCurrencyCompact(capitalOutlaySummary?.totals.actual || 0)}
              </div>
              <div className="text-sm text-slate-600 font-medium">Actual Spending</div>
            </div>

            <div className="stat-card glass-card rounded-2xl p-6 border border-emerald-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  (capitalOutlaySummary?.totals.variance || 0) >= 0 
                    ? 'bg-emerald-100' 
                    : 'bg-red-100'
                }`}>
                  {(capitalOutlaySummary?.totals.variance || 0) >= 0 ? (
                    <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <Badge className={`border-0 ${
                  (capitalOutlaySummary?.totals.variance || 0) >= 0 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {(capitalOutlaySummary?.totals.variance || 0) >= 0 ? 'Surplus' : 'Deficit'}
                </Badge>
              </div>
              <div className={`text-3xl font-bold mb-1 ${
                (capitalOutlaySummary?.totals.variance || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {formatCurrencyCompact(Math.abs(capitalOutlaySummary?.totals.variance || 0))}
              </div>
              <div className="text-sm text-slate-600 font-medium">Variance</div>
            </div>

            <div className="stat-card glass-card rounded-2xl p-6 border border-violet-200">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-violet-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-violet-600" />
                </div>
                <Badge className="bg-violet-100 text-violet-700 border-0">Rate</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {capitalOutlaySummary?.totals.planned 
                  ? ((capitalOutlaySummary.totals.actual / capitalOutlaySummary.totals.planned) * 100).toFixed(1)
                  : 0}%
              </div>
              <div className="text-sm text-slate-600 font-medium">Utilization Rate</div>
            </div>
          </div>

          {/* Budget Chart */}
          <div className="glass-card rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Budget Allocation & Spending</h3>
                <p className="text-slate-600">Planned vs actual expenditure by category</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-2xl">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart 
                data={capitalOutlaySummary?.items?.map(item => ({
                  category: item.label.length > 25 ? item.label.substring(0, 25) + '...' : item.label,
                  planned: item.planned,
                  actual: item.actual,
                })) || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <defs>
                  <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                    <stop offset="100%" stopColor={COLORS.primaryDark} stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.8}/>
                    <stop offset="100%" stopColor={COLORS.successDark} stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} 
                  tickFormatter={formatCurrencyCompact} 
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '12px 16px'
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="planned" 
                  name="Planned Budget" 
                  fill="url(#plannedGradient)" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
                <Bar 
                  dataKey="actual" 
                  name="Actual Spending" 
                  fill="url(#actualGradient)" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Revenue & Expenditure Section */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-12 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full shadow-lg" />
            <div>
              <h2 className="text-4xl font-bold text-slate-900">Revenue & Expenditure</h2>
              <p className="text-slate-600 mt-1">Comprehensive financial flow analysis</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="stat-card glass-card rounded-3xl p-8 relative overflow-hidden border border-emerald-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-emerald-100 rounded-2xl">
                    <TrendingUp className="w-8 h-8 text-emerald-600" />
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 px-4 py-1">Income</Badge>
                </div>
                <div className="text-4xl font-bold text-emerald-600 mb-2">
                  {formatCurrencyCompact(totalCollections)}
                </div>
                <div className="text-sm text-slate-600 font-semibold uppercase tracking-wider">Total Collections</div>
              </div>
            </div>

            <div className="stat-card glass-card rounded-3xl p-8 relative overflow-hidden border border-amber-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-amber-100 rounded-2xl">
                    <TrendingDown className="w-8 h-8 text-amber-600" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-0 px-4 py-1">Expense</Badge>
                </div>
                <div className="text-4xl font-bold text-amber-600 mb-2">
                  {formatCurrencyCompact(totalDisbursements)}
                </div>
                <div className="text-sm text-slate-600 font-semibold uppercase tracking-wider">Total Disbursements</div>
              </div>
            </div>

            <div className={`stat-card glass-card rounded-3xl p-8 relative overflow-hidden border ${surplus >= 0 ? 'border-emerald-200' : 'border-red-200'}`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl ${
                surplus >= 0 ? 'bg-emerald-400/20' : 'bg-red-400/20'
              }`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-4 rounded-2xl ${
                    surplus >= 0 ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {surplus >= 0 ? (
                      <ArrowUpRight className="w-8 h-8 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="w-8 h-8 text-red-600" />
                    )}
                  </div>
                  <Badge className={`border-0 px-4 py-1 ${
                    surplus >= 0 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {surplus >= 0 ? 'Surplus' : 'Deficit'}
                  </Badge>
                </div>
                <div className={`text-4xl font-bold mb-2 ${
                  surplus >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {formatCurrencyCompact(Math.abs(surplus))}
                </div>
                <div className="text-sm text-slate-600 font-semibold uppercase tracking-wider">Net Position</div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Revenue Sources</h3>
                  <p className="text-sm text-slate-600">Distribution of income</p>
                </div>
                <PieChartIcon className="w-6 h-6 text-blue-600" />
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={collectionsPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={60}
                    label={({ name, percent }) => `${name.substring(0, 12)}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  >
                    {collectionsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Expenditure Categories</h3>
                  <p className="text-sm text-slate-600">Distribution of spending</p>
                </div>
                <PieChartIcon className="w-6 h-6 text-amber-600" />
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={disbursementsPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={60}
                    label={({ name, percent }) => `${name.substring(0, 12)}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  >
                    {disbursementsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Transaction Records */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-12 bg-gradient-to-b from-violet-500 to-violet-600 rounded-full shadow-lg" />
            <div>
              <h2 className="text-4xl font-bold text-slate-900">Transaction Records</h2>
              <p className="text-slate-600 mt-1">Recent financial activities</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Collections */}
            <div className="glass-card rounded-3xl overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Collections</h3>
                    <p className="text-emerald-100 text-sm">Recent income transactions</p>
                  </div>
                </div>
              </div>
              <div className="p-0">
                <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-sm border-b border-slate-200">
                      <tr className="text-xs uppercase text-slate-600">
                        <th className="text-left py-4 px-6 font-bold">Date</th>
                        <th className="text-left py-4 px-6 font-bold">Category</th>
                        <th className="text-right py-4 px-6 font-bold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingCollections ? (
                        <tr>
                          <td colSpan={3} className="py-12 text-center text-slate-500">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                              <span>Loading collections...</span>
                            </div>
                          </td>
                        </tr>
                      ) : collections && collections.length > 0 ? (
                        collections.slice(0, 10).map((collection, index) => (
                          <tr key={collection.id} className="border-b border-slate-100 hover:bg-emerald-50/50 transition-all duration-200">
                            <td className="py-4 px-6 text-slate-600 whitespace-nowrap font-medium">
                              {new Date(collection.transactionDate).toLocaleDateString('en-PH', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="py-4 px-6 font-semibold text-slate-900 max-w-xs truncate" title={collection.category}>
                              {collection.category}
                            </td>
                            <td className="text-right py-4 px-6 font-bold text-emerald-600">
                              {formatCurrencyCompact(safeParseAmount(collection.amount))}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-12 text-center text-slate-500">
                            No collections data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Disbursements */}
            <div className="glass-card rounded-3xl overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Disbursements</h3>
                    <p className="text-amber-100 text-sm">Recent expense transactions</p>
                  </div>
                </div>
              </div>
              <div className="p-0">
                <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-sm border-b border-slate-200">
                      <tr className="text-xs uppercase text-slate-600">
                        <th className="text-left py-4 px-6 font-bold">Date</th>
                        <th className="text-left py-4 px-6 font-bold">Category</th>
                        <th className="text-right py-4 px-6 font-bold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingDisbursements ? (
                        <tr>
                          <td colSpan={3} className="py-12 text-center text-slate-500">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
                              <span>Loading disbursements...</span>
                            </div>
                          </td>
                        </tr>
                      ) : disbursements && disbursements.length > 0 ? (
                        disbursements.slice(0, 10).map((disbursement, index) => (
                          <tr key={disbursement.id} className="border-b border-slate-100 hover:bg-amber-50/50 transition-all duration-200">
                            <td className="py-4 px-6 text-slate-600 whitespace-nowrap font-medium">
                              {new Date(disbursement.transactionDate).toLocaleDateString('en-PH', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="py-4 px-6 font-semibold text-slate-900 max-w-xs truncate" title={disbursement.category}>
                              {disbursement.category}
                            </td>
                            <td className="text-right py-4 px-6 font-bold text-amber-600">
                              {formatCurrencyCompact(safeParseAmount(disbursement.amount))}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-12 text-center text-slate-500">
                            No disbursements data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Development Projects */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-12 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-lg" />
            <div>
              <h2 className="text-4xl font-bold text-slate-900">Development Projects</h2>
              <p className="text-slate-600 mt-1">Infrastructure and community initiatives</p>
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="stat-card glass-card rounded-3xl p-8 relative overflow-hidden border border-blue-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-blue-100 rounded-2xl">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-0 px-4 py-1">Total</Badge>
                </div>
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {dfurProjects?.length || 0}
                </div>
                <div className="text-sm text-slate-600 font-semibold uppercase tracking-wider">Active Projects</div>
              </div>
            </div>

            <div className="stat-card glass-card rounded-3xl p-8 relative overflow-hidden border border-emerald-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-emerald-100 rounded-2xl">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 px-4 py-1">Approved</Badge>
                </div>
                <div className="text-5xl font-bold text-emerald-600 mb-2">
                  {formatCurrencyCompact(totalApprovedCost)}
                </div>
                <div className="text-sm text-slate-600 font-semibold uppercase tracking-wider">Approved Cost</div>
              </div>
            </div>

            <div className="stat-card glass-card rounded-3xl p-8 relative overflow-hidden border border-amber-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-amber-100 rounded-2xl">
                    <Activity className="w-8 h-8 text-amber-600" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-0 px-4 py-1">Incurred</Badge>
                </div>
                <div className="text-5xl font-bold text-amber-600 mb-2">
                  {formatCurrencyCompact(totalIncurredCost)}
                </div>
                <div className="text-sm text-slate-600 font-semibold uppercase tracking-wider">Actual Cost</div>
              </div>
            </div>
          </div>

          {/* Projects Overview */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="glass-card rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Project Status</h3>
                  <p className="text-sm text-slate-600">Approval distribution</p>
                </div>
                <PieChartIcon className="w-6 h-6 text-violet-600" />
              </div>
              {isLoadingDfurProjects ? (
                <div className="flex items-center justify-center h-[320px]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                    <p className="text-slate-500">Loading project data...</p>
                  </div>
                </div>
              ) : dfurStatusPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={dfurStatusPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={60}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                    >
                      {dfurStatusPieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.name === "Approved" ? COLORS.success : 
                            entry.name === "Flagged" ? COLORS.danger : 
                            "#94a3b8"
                          } 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        padding: '8px 12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[320px]">
                  <p className="text-slate-500">No project data available</p>
                </div>
              )}
            </div>

            {/* Featured Projects */}
            <div className="glass-card rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Recent Projects</h3>
                  <p className="text-sm text-slate-600">Latest initiatives</p>
                </div>
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-4 max-h-[320px] overflow-y-auto custom-scrollbar pr-2">
                {dfurProjects && dfurProjects.length > 0 ? (
                  dfurProjects.slice(0, 5).map((project, index) => (
                    <div key={project.id} className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 mb-1 line-clamp-1" title={project.project}>
                            {project.project}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {project.location}
                          </p>
                        </div>
                        <Badge className={`shrink-0 ${
                          project.reviewStatus === "approved" 
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                            : project.reviewStatus === "flagged"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}>
                          {project.reviewStatus === "approved" ? "Approved" : project.reviewStatus === "flagged" ? "Flagged" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-blue-600">
                          {formatCurrencyCompact(safeParseAmount(project.totalCostApproved))}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(project.transactionDate).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    No projects available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* All Projects Table */}
          <div className="glass-card rounded-3xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-violet-500 to-violet-600 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">All Projects</h3>
                  <p className="text-violet-100 text-sm">Complete project listing</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 backdrop-blur-sm border-b-2 border-slate-200">
                  <tr className="text-xs uppercase text-slate-600">
                    <th className="text-left py-4 px-6 font-bold">Project</th>
                    <th className="text-left py-4 px-6 font-bold">Location</th>
                    <th className="text-right py-4 px-6 font-bold">Approved</th>
                    <th className="text-right py-4 px-6 font-bold">Incurred</th>
                    <th className="text-center py-4 px-6 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingDfurProjects ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                          <span>Loading projects...</span>
                        </div>
                      </td>
                    </tr>
                  ) : dfurProjects && dfurProjects.length > 0 ? (
                    dfurProjects.map((project, index) => (
                      <tr key={project.id} className="border-b border-slate-100 hover:bg-violet-50/30 transition-all duration-200">
                        <td className="py-4 px-6 font-semibold text-slate-900 max-w-xs truncate" title={project.project}>
                          {project.project}
                        </td>
                        <td className="py-4 px-6 text-slate-600 max-w-xs truncate" title={project.location}>
                          {project.location}
                        </td>
                        <td className="text-right py-4 px-6 font-bold text-slate-900">
                          {formatCurrency(safeParseAmount(project.totalCostApproved))}
                        </td>
                        <td className="text-right py-4 px-6 font-bold text-amber-600">
                          {formatCurrency(safeParseAmount(project.totalCostIncurred))}
                        </td>
                        <td className="text-center py-4 px-6">
                          <Badge className={`${
                            project.reviewStatus === "approved" 
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                              : project.reviewStatus === "flagged"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}>
                            {project.reviewStatus === "approved" ? "Approved" : project.reviewStatus === "flagged" ? "Flagged" : "Pending"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-500">
                        No projects data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Budget Detail Table */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-12 bg-gradient-to-b from-blue-500 to-violet-500 rounded-full shadow-lg" />
            <div>
              <h2 className="text-4xl font-bold text-slate-900">Budget Breakdown</h2>
              <p className="text-slate-600 mt-1">Detailed category analysis</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-500 to-violet-600 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Category Analysis</h3>
                  <p className="text-blue-100 text-sm">Budget allocation and utilization</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 backdrop-blur-sm border-b-2 border-slate-200">
                  <tr className="text-xs uppercase text-slate-600">
                    <th className="text-left py-5 px-6 font-bold">Category</th>
                    <th className="text-right py-5 px-6 font-bold">Planned</th>
                    <th className="text-right py-5 px-6 font-bold">Actual</th>
                    <th className="text-right py-5 px-6 font-bold">Variance</th>
                    <th className="text-right py-5 px-6 font-bold">Utilized %</th>
                  </tr>
                </thead>
                <tbody>
                  {capitalOutlaySummary?.items?.map((item, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-slate-100 hover:bg-blue-50/30 transition-all duration-200"
                    >
                      <td className="py-5 px-6 font-bold text-slate-900">{item.label}</td>
                      <td className="text-right py-5 px-6 text-slate-700 font-semibold">
                        {formatCurrency(item.planned)}
                      </td>
                      <td className="text-right py-5 px-6 text-slate-700 font-semibold">
                        {formatCurrency(item.actual)}
                      </td>
                      <td className={`text-right py-5 px-6 font-bold ${item.variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        <span className="inline-flex items-center gap-1">
                          {item.variance >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {formatCurrency(Math.abs(item.variance))}
                        </span>
                      </td>
                      <td className="text-right py-5 px-6">
                        <div className="flex items-center justify-end gap-3">
                          <div className="flex-1 max-w-[100px] h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                item.planned > 0 && ((item.actual / item.planned) * 100) > 90 
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                                  : 'bg-gradient-to-r from-amber-500 to-amber-600'
                              }`}
                              style={{ width: `${item.planned > 0 ? Math.min(((item.actual / item.planned) * 100), 100) : 0}%` }}
                            />
                          </div>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold min-w-[60px] justify-center ${
                            item.planned > 0 && ((item.actual / item.planned) * 100) > 90 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.planned > 0 ? ((item.actual / item.planned) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-12">
          <button
            onClick={() => navigate("/role-selection")}
            className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-lg
                       hover:from-blue-700 hover:to-violet-700 transition-all duration-300 shadow-xl hover:shadow-2xl
                       transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                          transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span className="relative flex items-center gap-2">
              Continue as User
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => navigate("/login")}
            className="group px-10 py-5 rounded-2xl border-2 border-blue-600 text-blue-700 bg-white
                       font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl
                       transform hover:-translate-y-1"
          >
            <span className="flex items-center gap-2">
              Login
              <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </span>
          </button>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="relative mt-20 overflow-hidden">
        <div className="absolute inset-0 glass-card-dark" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-4">
                Transparency Portal
              </h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                Building trust through complete financial transparency and accountability. 
                Empowering our community with real-time access to public finances.
              </p>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Shield className="w-5 h-5 text-violet-400" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-white text-lg">Quick Access</h4>
              <ul className="space-y-3 text-slate-300">
                <li className="hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Budget Reports
                </li>
                <li className="hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                  Project Updates
                </li>
                <li className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Financial Statements
                </li>
                <li className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Community Feedback
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-white text-lg">Contact</h4>
              <p className="text-slate-300 leading-relaxed">
                For inquiries and concerns, visit the Barangay Hall during office hours.
              </p>
              <div className="mt-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-xs text-slate-400 mb-1">Office Hours</p>
                <p className="text-sm text-white font-semibold">Mon - Fri, 8:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © {currentYear} Barangay Financial Transparency Portal. All data verified and audited.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Verified Data
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-blue-400" />
                Secure Access
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}