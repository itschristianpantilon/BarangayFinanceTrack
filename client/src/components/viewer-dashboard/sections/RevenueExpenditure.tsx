import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PieChart as PieChartIcon, Loader2 } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import { formatCurrency } from "../../../utils/formatters";
import { PIE_CHART_COLORS } from "../../../utils/constants";

type PieDataItem = { name: string; value: number; percentage?: number };

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
    percentage: item.percentage,
  }));
}

const RADIAN = Math.PI / 180;

// Custom label renderer — shows ALL slices with a polyline pointer
const renderCollectionsLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  percentage,
}: any) => {
  const isSmall = percentage < 5;
  // Push tiny slices further out so labels don't collide
  const labelRadius = outerRadius + (isSmall ? 52 : 32);
  const lineStartRadius = outerRadius + 6;
  const midKneeRadius = outerRadius + (isSmall ? 32 : 20);

  const sx = cx + lineStartRadius * Math.cos(-midAngle * RADIAN);
  const sy = cy + lineStartRadius * Math.sin(-midAngle * RADIAN);
  const mx = cx + midKneeRadius * Math.cos(-midAngle * RADIAN);
  const my = cy + midKneeRadius * Math.sin(-midAngle * RADIAN);
  const lx = cx + labelRadius * Math.cos(-midAngle * RADIAN);
  const ly = cy + labelRadius * Math.sin(-midAngle * RADIAN);

  const anchor = lx > cx ? "start" : "end";

  return (
    <g>
      <polyline
        points={`${sx},${sy} ${mx},${my} ${lx},${ly}`}
        stroke="#94a3b8"
        strokeWidth={1}
        fill="none"
      />
      <text
        x={lx + (anchor === "start" ? 4 : -4)}
        y={ly}
        fill="#475569"
        textAnchor={anchor}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={500}
      >
        {`${name}: ${percentage}%`}
      </text>
    </g>
  );
};

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
            <div className="flex items-center justify-center h-[360px]">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : collectionsError ? (
            <div className="flex items-center justify-center h-[360px] text-red-500 text-sm">
              {collectionsError}
            </div>
          ) : (
            <>
              {/* Taller container so pointer labels aren't clipped */}
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie
                    data={collectionsPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    labelLine={false}
                    label={(props) =>
                      renderCollectionsLabel({
                        ...props,
                        percentage: collectionsPieData[props.index]?.percentage,
                      })
                    }
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

              {/* Legend — raw API percentages, no rounding */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-1">
                {collectionsPieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] }}
                    />
                    <span>{item.name}</span>
                    <span className="text-slate-400">({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </>
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
            <div className="flex items-center justify-center h-[360px]">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : disbursementsError ? (
            <div className="flex items-center justify-center h-[360px] text-red-500 text-sm">
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
                    `${name.substring(0, 12)}: ${(percent * 100).toFixed(2)}%`
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