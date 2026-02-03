import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ViewerLayout } from "../../components/viewer-layout";
import { ViewerCommentForm } from "../../components/viewer-comment-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { TrendingUp, TrendingDown } from "lucide-react";

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

const COLORS = {
  primary: "#059669",
  secondary: "#10b981",
  tertiary: "#34d399",
  quaternary: "#6ee7b7",
  accent: "#a7f3d0",
};

// API fetch functions
const fetchCollections = async (): Promise<Collection[]> => {
  const response = await fetch(`${API_BASE_URL}/get-collection`);
  if (!response.ok) {
    throw new Error('Failed to fetch collections');
  }
  const data = await response.json();
  return data;
};

const fetchDisbursements = async (): Promise<Disbursement[]> => {
  const response = await fetch(`${API_BASE_URL}/get-disbursement`);
  if (!response.ok) {
    throw new Error('Failed to fetch disbursements');
  }
  const data = await response.json();
  return data;
};

const fetchDfurProjects = async (): Promise<DfurProject[]> => {
  const response = await fetch(`${API_BASE_URL}/get-dfur-project`);
  if (!response.ok) {
    throw new Error('Failed to fetch DFUR projects');
  }
  const data = await response.json();
  return data;
};

export default function ViewerDashboard() {
  const [activeTab, setActiveTab] = useState("abr");
  const currentYear = new Date().getFullYear();

  // Fetch collections
  const { data: collections, isLoading: isLoadingCollections } = useQuery<Collection[]>({
    queryKey: ['collections'],
    queryFn: fetchCollections,
    select: (data) => {
      // Clone and sort by transaction date descending
      return [...data].sort((a, b) => {
        const dateA = a.transactionDate ? new Date(a.transactionDate).getTime() : 
                     (a.createdAt ? new Date(a.createdAt).getTime() : Date.now());
        const dateB = b.transactionDate ? new Date(b.transactionDate).getTime() : 
                     (b.createdAt ? new Date(b.createdAt).getTime() : Date.now());
        return dateB - dateA;
      });
    },
  });

  // Fetch disbursements
  const { data: disbursements, isLoading: isLoadingDisbursements } = useQuery<Disbursement[]>({
    queryKey: ['disbursements'],
    queryFn: fetchDisbursements,
    select: (data) => {
      // Clone and sort by transaction date descending
      return [...data].sort((a, b) => {
        const dateA = a.transactionDate ? new Date(a.transactionDate).getTime() : 
                     (a.createdAt ? new Date(a.createdAt).getTime() : Date.now());
        const dateB = b.transactionDate ? new Date(b.transactionDate).getTime() : 
                     (b.createdAt ? new Date(b.createdAt).getTime() : Date.now());
        return dateB - dateA;
      });
    },
  });

  // Fetch DFUR projects
  const { data: dfurProjects, isLoading: isLoadingDfurProjects } = useQuery<DfurProject[]>({
    queryKey: ['dfurProjects'],
    queryFn: fetchDfurProjects,
  });

  // ABR Capital Outlay Summary (keep existing implementation)
  const { data: capitalOutlaySummary } = useQuery<CapitalOutlaySummary>({
    queryKey: ["/api/abr/capital-outlay-summary", currentYear],
  });

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatCurrencyCompact = (value: number) => {
    if (value >= 1000000) {
      return `₱${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `₱${(value / 1000).toFixed(0)}K`;
    }
    return `₱${value.toFixed(0)}`;
  };

  // Safe amount parser
  const safeParseAmount = (amount: string | null | undefined): number => {
    if (!amount) return 0;
    const num = Number(amount);
    return isNaN(num) ? 0 : num;
  };

  // SRE Calculations
  const totalCollections = collections?.reduce((sum, c) => sum + safeParseAmount(c.amount), 0) || 0;
  const totalDisbursements = disbursements?.reduce((sum, d) => sum + safeParseAmount(d.amount), 0) || 0;
  const surplus = totalCollections - totalDisbursements;

  // Collections by source
  const collectionsBySource = collections?.reduce((acc, c) => {
    const source = c.category || "Other";
    acc[source] = (acc[source] || 0) + safeParseAmount(c.amount);
    return acc;
  }, {} as Record<string, number>);

  const collectionsPieData = Object.entries(collectionsBySource || {}).map(([name, value]) => ({
    name,
    value,
  })).slice(0, 5);

  // Disbursements by category
  const disbursementsByCategory = disbursements?.reduce((acc, d) => {
    const category = d.category || "Other";
    acc[category] = (acc[category] || 0) + safeParseAmount(d.amount);
    return acc;
  }, {} as Record<string, number>);

  const disbursementsPieData = Object.entries(disbursementsByCategory || {}).map(([name, value]) => ({
    name,
    value,
  })).slice(0, 5);

  // DFUR Calculations
  const totalApprovedCost = dfurProjects?.reduce((sum, p) => sum + safeParseAmount(p.totalCostApproved), 0) || 0;
  const totalIncurredCost = dfurProjects?.reduce((sum, p) => sum + safeParseAmount(p.totalCostIncurred), 0) || 0;

  const dfurByStatus = dfurProjects?.reduce((acc, p) => {
    const status = p.reviewStatus === "approved" ? "Approved" : p.reviewStatus === "flagged" ? "Flagged" : "Pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dfurStatusPieData = Object.entries(dfurByStatus || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <ViewerLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-poppins text-foreground">Financial Dashboard</h1>
          <p className="text-muted-foreground mt-1">Comprehensive financial overview and analytics</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="abr" data-testid="tab-abr">ABR</TabsTrigger>
            <TabsTrigger value="sre" data-testid="tab-sre">SRE</TabsTrigger>
            <TabsTrigger value="dfur" data-testid="tab-dfur">DFUR</TabsTrigger>
            <TabsTrigger value="comments" data-testid="tab-comments">Comments</TabsTrigger>
          </TabsList>

          {/* ABR Tab */}
          <TabsContent value="abr" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-medium">Planned Budget</CardDescription>
                  <CardTitle className="text-2xl font-bold" data-testid="text-total-planned">
                    {formatCurrencyCompact(capitalOutlaySummary?.totals.planned || 0)}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-medium">Actual Spending</CardDescription>
                  <CardTitle className="text-2xl font-bold" data-testid="text-total-actual">
                    {formatCurrencyCompact(capitalOutlaySummary?.totals.actual || 0)}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-medium">Variance</CardDescription>
                  <CardTitle 
                    className={`text-2xl font-bold flex items-center gap-2 ${
                      (capitalOutlaySummary?.totals.variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                    data-testid="text-budget-variance"
                  >
                    {(capitalOutlaySummary?.totals.variance || 0) >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    {formatCurrencyCompact(Math.abs(capitalOutlaySummary?.totals.variance || 0))}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-medium">Utilization Rate</CardDescription>
                  <CardTitle className="text-2xl font-bold" data-testid="text-utilization-rate">
                    {capitalOutlaySummary?.totals.planned 
                      ? ((capitalOutlaySummary.totals.actual / capitalOutlaySummary.totals.planned) * 100).toFixed(1)
                      : 0}%
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Budget vs Actual by Category</CardTitle>
                <CardDescription>Comparing planned budget and actual spending</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart 
                    data={capitalOutlaySummary?.items?.map(item => ({
                      category: item.label.length > 20 ? item.label.substring(0, 20) + '...' : item.label,
                      planned: item.planned,
                      actual: item.actual,
                    })) || []}
                    margin={{ top: 10, right: 20, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="category" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={formatCurrencyCompact} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                    <Bar dataKey="planned" name="Planned" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" name="Actual" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Detailed Breakdown</CardTitle>
                <CardDescription>Category-wise budget analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs uppercase text-muted-foreground">
                        <th className="text-left py-2 px-3 font-semibold">Category</th>
                        <th className="text-right py-2 px-3 font-semibold">Planned</th>
                        <th className="text-right py-2 px-3 font-semibold">Actual</th>
                        <th className="text-right py-2 px-3 font-semibold">Variance</th>
                        <th className="text-right py-2 px-3 font-semibold">Used %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {capitalOutlaySummary?.items?.map((item, index) => (
                        <tr 
                          key={index} 
                          className="border-b hover-elevate"
                          data-testid={`row-capital-outlay-${index}`}
                        >
                          <td className="py-2 px-3 font-medium" data-testid={`text-category-${index}`}>
                            {item.label}
                          </td>
                          <td className="text-right py-2 px-3" data-testid={`text-planned-${index}`}>
                            {formatCurrency(item.planned)}
                          </td>
                          <td className="text-right py-2 px-3" data-testid={`text-actual-${index}`}>
                            {formatCurrency(item.actual)}
                          </td>
                          <td 
                            className={`text-right py-2 px-3 font-medium ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            data-testid={`text-variance-${index}`}
                          >
                            {formatCurrency(item.variance)}
                          </td>
                          <td className="text-right py-2 px-3" data-testid={`text-utilization-${index}`}>
                            {item.planned > 0 ? ((item.actual / item.planned) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SRE Tab */}
          <TabsContent value="sre" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-medium">Total Collections</CardDescription>
                  <CardTitle className="text-2xl font-bold text-green-600" data-testid="text-total-collections">
                    {formatCurrencyCompact(totalCollections)}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-medium">Total Disbursements</CardDescription>
                  <CardTitle className="text-2xl font-bold text-orange-600" data-testid="text-total-disbursements">
                    {formatCurrencyCompact(totalDisbursements)}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-medium">Net Surplus/Deficit</CardDescription>
                  <CardTitle 
                    className={`text-2xl font-bold ${surplus >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    data-testid="text-surplus"
                  >
                    {formatCurrencyCompact(surplus)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Collections by Source</CardTitle>
                  <CardDescription>Top 5 revenue sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={collectionsPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, value }) => `${name.substring(0, 15)}: ${formatCurrencyCompact(value)}`}
                        labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                      >
                        {collectionsPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Disbursements by Category</CardTitle>
                  <CardDescription>Top 5 expense categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={disbursementsPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, value }) => `${name.substring(0, 15)}: ${formatCurrencyCompact(value)}`}
                        labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                      >
                        {disbursementsPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown Tables */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Collections Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Collections Breakdown</CardTitle>
                  <CardDescription>Detailed list of all collections (receipts)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-card">
                        <tr className="border-b text-xs uppercase text-muted-foreground">
                          <th className="text-left py-2 px-3 font-semibold">Date</th>
                          <th className="text-left py-2 px-3 font-semibold">Category</th>
                          <th className="text-left py-2 px-3 font-semibold">Payor</th>
                          <th className="text-right py-2 px-3 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingCollections ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-muted-foreground" data-testid="loading-collections">
                              Loading collections...
                            </td>
                          </tr>
                        ) : collections && collections.length > 0 ? (
                          collections.map((collection, index) => (
                            <tr key={collection.id} className="border-b hover-elevate" data-testid={`row-collection-${index}`}>
                              <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                                {new Date(collection.transactionDate).toLocaleDateString('en-PH', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </td>
                              <td className="py-2 px-3 font-medium max-w-xs truncate" title={collection.category}>
                                {collection.category}
                              </td>
                              <td className="py-2 px-3 text-muted-foreground max-w-xs truncate" title={collection.payor}>
                                {collection.payor}
                              </td>
                              <td className="text-right py-2 px-3 font-semibold text-green-600" data-testid={`amount-collection-${index}`}>
                                {formatCurrency(safeParseAmount(collection.amount))}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-muted-foreground">
                              No collections data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Disbursements Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Disbursements Breakdown</CardTitle>
                  <CardDescription>Detailed list of all disbursements (expenditures)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-card">
                        <tr className="border-b text-xs uppercase text-muted-foreground">
                          <th className="text-left py-2 px-3 font-semibold">Date</th>
                          <th className="text-left py-2 px-3 font-semibold">Category</th>
                          <th className="text-left py-2 px-3 font-semibold">Payee</th>
                          <th className="text-right py-2 px-3 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingDisbursements ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-muted-foreground" data-testid="loading-disbursements">
                              Loading disbursements...
                            </td>
                          </tr>
                        ) : disbursements && disbursements.length > 0 ? (
                          disbursements.map((disbursement, index) => (
                            <tr key={disbursement.id} className="border-b hover-elevate" data-testid={`row-disbursement-${index}`}>
                              <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                                {new Date(disbursement.transactionDate).toLocaleDateString('en-PH', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </td>
                              <td className="py-2 px-3 font-medium max-w-xs truncate" title={disbursement.category}>
                                {disbursement.category}
                              </td>
                              <td className="py-2 px-3 text-muted-foreground max-w-xs truncate" title={disbursement.payee}>
                                {disbursement.payee}
                              </td>
                              <td className="text-right py-2 px-3 font-semibold text-orange-600" data-testid={`amount-disbursement-${index}`}>
                                {formatCurrency(safeParseAmount(disbursement.amount))}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-muted-foreground">
                              No disbursements data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DFUR Tab */}
          <TabsContent value="dfur" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-medium">Total Projects</CardDescription>
                  <CardTitle className="text-2xl font-bold">
                    {dfurProjects?.length || 0}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-medium">Approved Cost</CardDescription>
                  <CardTitle className="text-2xl font-bold text-green-600">
                    {formatCurrencyCompact(totalApprovedCost)}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-medium">Incurred Cost</CardDescription>
                  <CardTitle className="text-2xl font-bold text-orange-600">
                    {formatCurrencyCompact(totalIncurredCost)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Project Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Project Status Distribution</CardTitle>
                <CardDescription>Overview of project approval status</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDfurProjects ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">Loading project data...</p>
                  </div>
                ) : dfurStatusPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dfurStatusPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                      >
                        {dfurStatusPieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name === "Approved" ? COLORS.primary : 
                              entry.name === "Flagged" ? "#ef4444" : 
                              "#94a3b8"
                            } 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">No project data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Projects Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">All Projects</CardTitle>
                <CardDescription>Complete list of development fund utilization projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs uppercase text-muted-foreground">
                        <th className="text-left py-2 px-3 font-semibold">Project</th>
                        <th className="text-left py-2 px-3 font-semibold">Location</th>
                        <th className="text-right py-2 px-3 font-semibold">Approved Cost</th>
                        <th className="text-right py-2 px-3 font-semibold">Incurred Cost</th>
                        <th className="text-center py-2 px-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingDfurProjects ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            Loading projects...
                          </td>
                        </tr>
                      ) : dfurProjects && dfurProjects.length > 0 ? (
                        dfurProjects.map((project, index) => (
                          <tr key={project.id} className="border-b hover-elevate">
                            <td className="py-2 px-3 font-medium max-w-xs truncate" title={project.project}>
                              {project.project}
                            </td>
                            <td className="py-2 px-3 text-muted-foreground max-w-xs truncate" title={project.location}>
                              {project.location}
                            </td>
                            <td className="text-right py-2 px-3">
                              {formatCurrency(safeParseAmount(project.totalCostApproved))}
                            </td>
                            <td className="text-right py-2 px-3">
                              {formatCurrency(safeParseAmount(project.totalCostIncurred))}
                            </td>
                            <td className="text-center py-2 px-3">
                              <Badge 
                                className={
                                  project.reviewStatus === "approved" 
                                    ? "bg-green-600 text-white" 
                                    : project.reviewStatus === "flagged"
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-400 text-white"
                                }
                              >
                                {project.reviewStatus === "approved" ? "Approved" : project.reviewStatus === "flagged" ? "Flagged" : "Pending"}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No projects data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <div className="max-w-3xl">
              <ViewerCommentForm contextType="general" />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">About Public Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Your feedback is important to us! This comment system allows citizens to share their thoughts,
                  questions, and suggestions about our barangay's financial transparency and operations.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>All comments are reviewed by our admin team before publication</li>
                  <li>You can submit comments anonymously or provide your contact information</li>
                  <li>Comments should be respectful and constructive</li>
                  <li>We aim to review and respond to comments within 3-5 business days</li>
                </ul>
                <p className="mt-4 text-xs">
                  <strong>Privacy Notice:</strong> Contact information is kept confidential and used only
                  for follow-up purposes if needed.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ViewerLayout>
  );
}