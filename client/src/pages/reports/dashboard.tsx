import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { StatCard } from "../../components/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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


const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// Local types for static data
export type FinancialSummary = {
  totalRevenues: number;
  totalExpenses: number;
  netBalance: number;
  currentMonthRevenues: number;
  revenueGrowth: number; // percentage
  expenseGrowth: number; // percentage
};

export type MonthlyData = {
  month: string;
  revenues: number;
  expenses: number;
};

export type CategoryData = {
  category: string;
  amount: number;
  percentage?: number;
};

// Financial summary
const summaryStatic: FinancialSummary = {
  totalRevenues: 5000000,
  totalExpenses: 3200000,
  netBalance: 1800000,
  currentMonthRevenues: 420000,
  revenueGrowth: 8,   // +8%
  expenseGrowth: -5,  // -5%
};

// Monthly revenue & expenses
const monthlyDataStatic: MonthlyData[] = [
  { month: "Jan", revenues: 400000, expenses: 300000 },
  { month: "Feb", revenues: 450000, expenses: 350000 },
  { month: "Mar", revenues: 500000, expenses: 400000 },
  { month: "Apr", revenues: 550000, expenses: 420000 },
  { month: "May", revenues: 480000, expenses: 380000 },
];

// Revenue by category
const revenueByCategoryStatic: CategoryData[] = [
  { category: "Taxes", amount: 2000000, percentage: 40 },
  { category: "Fees", amount: 1500000, percentage: 30 },
  { category: "Grants", amount: 1000000, percentage: 20 },
  { category: "Donations", amount: 500000, percentage: 10 },
];

// Expense by category
const expenseByCategoryStatic: CategoryData[] = [
  { category: "Salaries", amount: 1500000, percentage: 47 },
  { category: "Infrastructure", amount: 1000000, percentage: 31 },
  { category: "Operations", amount: 700000, percentage: 22 },
];


export default function Dashboard() {
  const summary = summaryStatic;
const monthlyData = monthlyDataStatic;
const revenueByCategory = revenueByCategoryStatic;
const expenseByCategory = expenseByCategoryStatic;

  if (!summary || !monthlyData || !revenueByCategory || !expenseByCategory) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-80 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="p-8 space-y-8">
      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenues"
          value={formatCurrency(summary?.totalRevenues || 0)}
          icon={TrendingUp}
          trend={
            summary?.revenueGrowth
              ? {
                  value: summary.revenueGrowth,
                  isPositive: summary.revenueGrowth >= 0,
                }
              : undefined
          }
          gradientFrom="from-chart-1/5"
          gradientTo="to-chart-1/10"
          testId="text-total-revenues"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary?.totalExpenses || 0)}
          icon={TrendingDown}
          trend={
            summary?.expenseGrowth
              ? {
                  value: summary.expenseGrowth,
                  isPositive: summary.expenseGrowth < 0,
                }
              : undefined
          }
          gradientFrom="from-destructive/5"
          gradientTo="to-destructive/10"
          testId="text-total-expenses"
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(summary?.netBalance || 0)}
          icon={DollarSign}
          gradientFrom="from-chart-3/5"
          gradientTo="to-chart-3/10"
          testId="text-net-balance"
        />
        <StatCard
          title="Current Month Revenue"
          value={formatCurrency(summary?.currentMonthRevenues || 0)}
          icon={Wallet}
          gradientFrom="from-chart-4/5"
          gradientTo="to-chart-4/10"
          testId="text-current-month-revenue"
        />
      </div>

      {/* Monthly Comparison Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-poppins">
            Revenue vs Expenses - Monthly Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyData || []}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--foreground))"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="hsl(var(--foreground))"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Bar
                dataKey="revenues"
                fill="hsl(var(--chart-1))"
                name="Revenues"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill="hsl(var(--chart-5))"
                name="Expenses"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-poppins">Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByCategory || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) =>
                    `${category} (${percentage}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {(revenueByCategory || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-poppins">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseByCategory || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) =>
                    `${category} (${percentage}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {(expenseByCategory || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
