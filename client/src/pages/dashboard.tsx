import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { StatCard } from "../components/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
import type {
  FinancialSummary,
  MonthlyData,
  CategoryData,
} from "../../../deleted/shared/schema";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } =
    useQuery<FinancialSummary>({
      queryKey: ["/api/financial-summary"],
    });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery<
    MonthlyData[]
  >({
    queryKey: ["/api/monthly-data"],
  });

  const { data: revenueByCategory, isLoading: revenueCategoryLoading } =
    useQuery<CategoryData[]>({
      queryKey: ["/api/revenue-by-category"],
    });

  const { data: expenseByCategory, isLoading: expenseCategoryLoading } =
    useQuery<CategoryData[]>({
      queryKey: ["/api/expense-by-category"],
    });

  if (
    summaryLoading ||
    monthlyLoading ||
    revenueCategoryLoading ||
    expenseCategoryLoading
  ) {
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
