import { Badge } from "../../ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import LoadingSpinner from "../ui/LoadingSpinner";
import { COLORS } from "../../../utils/constants";
import {
  formatCurrency,
  formatCurrencyCompact,
} from "../../../utils/formatters";

type BudgetAnalysisItem = {
  category: string;
  planned: number;
  actual: number;
  variance: number;
};

type FinancialOverviewProps = {
  totalCollections: number;
  totalDisbursements: number;
  surplus: number;
  utilizationRate: string;
  budgetAnalysisData: BudgetAnalysisItem[];
  isLoadingBudgetEntries: boolean;
  isLoadingDisbursements: boolean;
};

export default function FinancialOverview({
  totalCollections,
  totalDisbursements,
  surplus,
  utilizationRate,
  budgetAnalysisData,
  isLoadingBudgetEntries,
  isLoadingDisbursements,
}: FinancialOverviewProps) {
  return (
    <section>
      <SectionHeader
        title="Financial Overview"
        subtitle="Real-time budget tracking and utilization"
        gradientFrom="from-blue-500"
        gradientTo="to-blue-600"
      />

      {/* Budget Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="glass-card rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-0">
              Collections
            </Badge>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {formatCurrencyCompact(totalCollections)}
          </div>
          <div className="text-sm text-slate-600 font-medium">Total Income <p className="mt-1 font-bold">(Kabuuang Kita)</p></div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-amber-200">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
            <Badge className="bg-amber-100 text-amber-700 border-0">
              Disbursements
            </Badge>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {formatCurrencyCompact(totalDisbursements)}
          </div>
          <div className="text-sm text-slate-600 font-medium">
            Total Expenses <p className="mt-1 font-bold">(Kabuuang Gastos)</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-emerald-200">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`p-3 rounded-xl ${surplus >= 0 ? "bg-emerald-100" : "bg-red-100"}`}
            >
              {surplus >= 0 ? (
                <ArrowUpRight className="w-6 h-6 text-emerald-600" />
              ) : (
                <ArrowDownRight className="w-6 h-6 text-red-600" />
              )}
            </div>
            <Badge
              className={`border-0 text-center flex flex-col ${
                surplus >= 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <p className="font-semibold">{surplus >= 0 ? "Surplus" : "Deficit"}{" "}</p>
              <p className="font-extrabold">{surplus >= 0 ? "(Sobra)" : "(Kulangan)"}</p>
            </Badge>
          </div>
          <div
            className={`text-3xl font-bold mb-1 ${
              surplus >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {formatCurrencyCompact(Math.abs(surplus))}
          </div>
          <div className="text-sm text-slate-600 font-medium">Net Position <p className="mt-1 font-bold">(Natitirang Pondo)</p></div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-violet-200">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-violet-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-violet-600" />
            </div>
            <Badge className="bg-violet-100 text-violet-700 border-0">
              Rate
            </Badge>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {utilizationRate}%
          </div>
          <div className="text-sm text-slate-600 font-medium">
            Utilization Rate
            <p className="mt-1 font-bold">(Porsyento ng Paggamit)</p>
          </div>
        </div>
      </div>

      {/* Budget Analysis Chart */}
      {/* <div className="glass-card rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
              Budget Analysis
            </h3>
            <p className="text-slate-600 text-xs md:text-base">
              Annual Budget Ordinance (ABO) vs. Statement of Receipts &amp;
              Expenditures (SRE) — actual spending by programme
            </p>
          </div>
          <div className="p-2 md:p-4 bg-blue-100 rounded-2xl">
            <BarChart3 className="w-7 h-7 text-blue-600" />
          </div>
        </div>

        {isLoadingBudgetEntries || isLoadingDisbursements ? (
          <LoadingSpinner
            color="blue"
            message="Loading budget data…"
            height="h-[450px]"
          />
        ) : budgetAnalysisData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-slate-500">
              No ABO data available for this year.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={budgetAnalysisData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <defs>
                <linearGradient id="aboGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={COLORS.primary}
                    stopOpacity={0.85}
                  />
                  <stop
                    offset="100%"
                    stopColor={COLORS.primaryDark}
                    stopOpacity={0.65}
                  />
                </linearGradient>
                <linearGradient id="sreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={COLORS.success}
                    stopOpacity={0.85}
                  />
                  <stop
                    offset="100%"
                    stopColor={COLORS.successDark}
                    stopOpacity={0.65}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                opacity={0.5}
              />
              <XAxis
                dataKey="category"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                tickFormatter={formatCurrencyCompact}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === "planned" ? "ABO (Planned)" : "SRE (Actual)",
                ]}
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.97)",
                  border: "none",
                  borderRadius: "16px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  backdropFilter: "blur(10px)",
                  padding: "12px 16px",
                }}
                cursor={{ fill: "rgba(59,130,246,0.08)" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                formatter={(value) =>
                  value === "planned"
                    ? "ABO – Planned Budget"
                    : "SRE – Actual Spending"
                }
              />
              <Bar
                dataKey="planned"
                name="planned"
                fill="url(#aboGradient)"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
              <Bar
                dataKey="actual"
                name="actual"
                fill="url(#sreGradient)"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div> */}
    </section>
  );
}
