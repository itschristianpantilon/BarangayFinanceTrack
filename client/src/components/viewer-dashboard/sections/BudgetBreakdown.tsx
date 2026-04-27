import { BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import LoadingSpinner from "../ui/LoadingSpinner";
import { formatCurrency } from "../../../utils/formatters";

type AboBreakdownItem = {
  category: string;
  planned: number;
  actual: number;
  variance: number;
  fund_source: string;
  is20Percent: boolean;
};

type BudgetBreakdownProps = {
  aboBreakdownData: AboBreakdownItem[];
  isLoadingBudgetEntries: boolean;
  currentYear: number;
};

export default function BudgetBreakdown({
  aboBreakdownData,
  isLoadingBudgetEntries,
  currentYear,
}: BudgetBreakdownProps) {


  return (
    <section>
      <SectionHeader
        title="Budget Breakdown"
        subtitle="Based on the Annual Budget Ordinance (ABO) — appropriations by expenditure programme"
        gradientFrom="from-blue-500"
        gradientTo="to-violet-500"
      />

      <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-blue-500 to-violet-600 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">ABO Category Analysis</h3>
              <p className="text-blue-100 text-sm">
                ABO appropriations vs. SRE actual spending · 20%-fund items link to DFUR
              </p>
            </div>
          </div>
        </div>

        {isLoadingBudgetEntries ? (
          <LoadingSpinner
            color="violet"
            message="Loading ABO data…"
            height="h-[200px]"
          />
        ) : aboBreakdownData.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-500">
              No ABO budget entries found for {currentYear}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 backdrop-blur-sm border-b-2 border-slate-200">
                <tr className="text-xs uppercase text-slate-600">
                  <th className="text-left py-5 px-6 font-bold">Expenditure Programme</th>
                  {/* <th className="text-left py-5 px-4 font-bold">Fund Source</th> */}
                  <th className="text-right py-5 px-6 font-bold">ABO (Planned)</th>
                  <th className="text-right py-5 px-6 font-bold">SRE (Actual)</th>
                  <th className="text-right py-5 px-6 font-bold">Variance</th>
                  <th className="text-right py-5 px-6 font-bold">Utilized %</th>
                </tr>
              </thead>
              <tbody>
                {aboBreakdownData.map((item, index) => {
                  const utilizedPct =
                    item.planned > 0
                      ? ((item.actual / item.planned) * 100).toFixed(1)
                      : "0";
                  const isHighUtilization =
                    item.planned > 0 && (item.actual / item.planned) * 100 > 90;

                  return (
                    <tr
                      key={index}
                      className="border-b border-slate-100 hover:bg-blue-50/30 transition-all duration-200"
                    >
                      <td className="py-5 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-wrap">{item.category}</p>
                          {item.is20Percent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200 whitespace-nowrap">
                              20% → DFUR
                            </span>
                          )}
                        </div>
                      </td>
                      {/* <td className="py-5 px-4 text-slate-600 text-xs whitespace-nowrap">
                        {item.fund_source || "—"}
                      </td> */}
                      <td className="text-right py-5 px-6 text-slate-700 font-semibold">
                        {formatCurrency(item.planned)}
                      </td>
                      <td className="text-right py-5 px-6 text-slate-700 font-semibold">
                        {formatCurrency(item.actual)}
                      </td>
                      <td
                        className={`text-right py-5 px-6 font-bold ${
                          item.variance >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {item.variance >= 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          {formatCurrency(Math.abs(item.variance))}
                        </span>
                      </td>
                      <td className="text-right py-5 px-6">
                        <div className="flex items-center justify-end gap-3">
                          <div className="flex-1 max-w-[100px] h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isHighUtilization
                                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                  : "bg-gradient-to-r from-amber-500 to-amber-600"
                              }`}
                              style={{
                                width: `${
                                  item.planned > 0
                                    ? Math.min((item.actual / item.planned) * 100, 100)
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold min-w-[60px] justify-center ${
                              isHighUtilization
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {utilizedPct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                <tr>
                  <td
                    colSpan={2}
                    className="py-4 px-6 font-bold text-slate-800 text-sm uppercase tracking-wide"
                  >
                    Total
                  </td>
                  <td className="text-right py-4 px-6 font-bold text-blue-700">
                    {formatCurrency(aboBreakdownData.reduce((s, r) => s + r.planned, 0))}
                  </td>
                  <td className="text-right py-4 px-6 font-bold text-emerald-700">
                    {formatCurrency(aboBreakdownData.reduce((s, r) => s + r.actual, 0))}
                  </td>
                  <td className="text-right py-4 px-6 font-bold text-slate-700">
                    {formatCurrency(aboBreakdownData.reduce((s, r) => s + r.variance, 0))}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}