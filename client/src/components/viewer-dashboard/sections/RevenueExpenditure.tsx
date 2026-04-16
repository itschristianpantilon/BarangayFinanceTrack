import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieChartIcon, Loader2 } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import { formatCurrency } from "../../../utils/formatters";
import { PIE_CHART_COLORS } from "../../../utils/constants";

type PieDataItem = { name: string; value: number };

type SummaryItem = {
  category: string;
  percentage: number;
  total: number;
};

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.95)",
  border: "none",
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  padding: "8px 12px",
};

async function fetchSummary(url: string): Promise<PieDataItem[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const json = await res.json();
  return (json.data as SummaryItem[]).map((item) => ({
    name: item.category,
    value: item.total,
  }));
}

export default function RevenueExpenditure() {
  const [collectionsPieData, setCollectionsPieData] = useState<PieDataItem[]>([]);
  const [disbursementsPieData, setDisbursementsPieData] = useState<PieDataItem[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [isLoadingDisbursements, setIsLoadingDisbursements] = useState(true);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);
  const [disbursementsError, setDisbursementsError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary(
      "https://barangayfinancetrackbackenddeployment.onrender.com/api/get-collection-summary"
    )
      .then((data) => setCollectionsPieData(data))
      .catch((err) => setCollectionsError(err.message))
      .finally(() => setIsLoadingCollections(false));

    fetchSummary(
      "https://barangayfinancetrackbackenddeployment.onrender.com/api/get-disbursement-summary"
    )
      .then((data) => setDisbursementsPieData(data))
      .catch((err) => setDisbursementsError(err.message))
      .finally(() => setIsLoadingDisbursements(false));
  }, []);

  return (
    <section id="revenue">
      <SectionHeader
        title="Revenue & Expenditure"
        subtitle="Comprehensive financial flow analysis"
        gradientFrom="from-emerald-500"
        gradientTo="to-emerald-600"
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Sources */}
        <div className="glass-card rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Revenue Sources</h3>
              <p className="text-sm text-slate-600">Distribution of income</p>
            </div>
            <PieChartIcon className="w-6 h-6 text-blue-600" />
          </div>

          {isLoadingCollections ? (
            <div className="flex items-center justify-center h-[320px]">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : collectionsError ? (
            <div className="flex items-center justify-center h-[320px] text-red-500 text-sm">
              {collectionsError}
            </div>
          ) : (
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
                  label={({ name, percent }) =>
                    `${name.substring(0, 12)}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                >
                  {collectionsPieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={tooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expenditure Categories */}
        <div className="glass-card rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Expenditure Categories
              </h3>
              <p className="text-sm text-slate-600">Distribution of spending</p>
            </div>
            <PieChartIcon className="w-6 h-6 text-amber-600" />
          </div>

          {isLoadingDisbursements ? (
            <div className="flex items-center justify-center h-[320px]">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : disbursementsError ? (
            <div className="flex items-center justify-center h-[320px] text-red-500 text-sm">
              {disbursementsError}
            </div>
          ) : (
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
                  label={({ name, percent }) =>
                    `${name.substring(0, 12)}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                >
                  {disbursementsPieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={tooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}