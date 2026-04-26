import { Badge } from "../../ui/badge";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  FileText,
  CheckCircle2,
  Activity,
  PieChart as PieChartIcon,
} from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import LoadingSpinner from "../ui/LoadingSpinner";
import { formatCurrency, formatCurrencyCompact, safeParseAmount } from "../../../utils/formatters";
import { COLORS } from "../../../utils/constants";
import type { DfurProject } from "../../../types";

type PieDataItem = { name: string; value: number };

type DevelopmentProjectsProps = {
  dfurProjects: DfurProject[] | undefined;
  dfurStatusPieData: PieDataItem[];
  totalApprovedCost: number;
  totalIncurredCost: number;
  isLoadingDfurProjects: boolean;
};

const statusColor = (status?: "planned" | "in_progress" | "completed" | "on_hold" | "cancelled") => {
  if (status === "planned") return "bg-blue-100 text-blue-700 border-blue-200";
  if (status === "in_progress") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (status === "completed") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "on_hold") return "bg-gray-100 text-gray-700 border-gray-200";
  if (status === "cancelled") return "bg-red-100 text-red-700 border-red-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

const statusLabel = (status?: "planned" | "in_progress" | "completed" | "on_hold" | "cancelled") => {
  if (status === "planned") return "Planned";
  if (status === "in_progress") return "In Progress";
  if (status === "completed") return "Completed";
  if (status === "on_hold") return "On Hold";
  if (status === "cancelled") return "Cancelled";
  return "Unknown";
};

const utilizationBarColor = (pct: number) => {
  if (pct >= 90) return "from-emerald-500 to-emerald-600";
  if (pct >= 50) return "from-amber-500 to-amber-600";
  return "from-blue-400 to-blue-500";
};

const utilizationBadgeColor = (pct: number) => {
  if (pct >= 90) return "bg-emerald-100 text-emerald-700";
  if (pct >= 50) return "bg-amber-100 text-amber-700";
  return "bg-blue-100 text-blue-700";
};

export default function DevelopmentProjects({
  dfurProjects,
  dfurStatusPieData,
  totalApprovedCost,
  totalIncurredCost,
  isLoadingDfurProjects,
}: DevelopmentProjectsProps) {
  return (
    <section id="projects">
      <SectionHeader
        title="Development Projects"
        subtitle="Infrastructure and community initiatives"
        gradientFrom="from-blue-500"
        gradientTo="to-blue-600"
      />

      {/* Project Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden border border-blue-200">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-blue-400/20 rounded-full blur-2xl sm:blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3 sm:mb-5 lg:mb-6">
              <div className="p-2 sm:p-3 lg:p-4 bg-blue-100 rounded-xl sm:rounded-2xl">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-0 px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 text-xs sm:text-sm">
                Total
              </Badge>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 mb-1 sm:mb-2">
              {dfurProjects?.length || 0}
            </div>
            <div className="text-xs sm:text-sm text-slate-600 font-semibold uppercase tracking-wider">
              Active Projects
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden border border-emerald-200">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-emerald-400/20 rounded-full blur-2xl sm:blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3 sm:mb-5 lg:mb-6">
              <div className="p-2 sm:p-3 lg:p-4 bg-emerald-100 rounded-xl sm:rounded-2xl">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-emerald-600" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 text-xs sm:text-sm">
                Approved
              </Badge>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-emerald-600 mb-1 sm:mb-2">
              {formatCurrencyCompact(totalApprovedCost)}
            </div>
            <div className="text-xs sm:text-sm text-slate-600 font-semibold uppercase tracking-wider">
              Approved Cost
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden border border-amber-200">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-amber-400/20 rounded-full blur-2xl sm:blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3 sm:mb-5 lg:mb-6">
              <div className="p-2 sm:p-3 lg:p-4 bg-amber-100 rounded-xl sm:rounded-2xl">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-amber-600" />
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-0 px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 text-xs sm:text-sm">
                Incurred
              </Badge>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-amber-600 mb-1 sm:mb-2">
              {formatCurrencyCompact(totalIncurredCost)}
            </div>
            <div className="text-xs sm:text-sm text-slate-600 font-semibold uppercase tracking-wider">
              Actual Cost
            </div>
          </div>
        </div>
      </div>

      {/* Overview Charts */}
      <div className="grid md:grid-cols-1 gap-6 mb-8">
        <div className="glass-card rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Project Status</h3>
              <p className="text-sm text-slate-600">Approval distribution</p>
            </div>
            <PieChartIcon className="w-6 h-6 text-violet-600" />
          </div>
          {isLoadingDfurProjects ? (
            <LoadingSpinner color="violet" message="Loading project data..." height="h-[320px]" />
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
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                >
                  {dfurStatusPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === "Approved"
                          ? COLORS.success
                          : entry.name === "Flagged"
                          ? COLORS.danger
                          : "#94a3b8"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    padding: "8px 12px",
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
      </div>

      {/* All Projects — card list on mobile, table on md+ */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-violet-500 to-violet-600 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">All Projects</h3>
              <p className="text-violet-100 text-xs sm:text-sm">Complete project listing</p>
            </div>
          </div>
        </div>

        {/* ── Mobile card list (hidden on md+) ── */}
        <div className="md:hidden divide-y divide-slate-100">
          {isLoadingDfurProjects ? (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-500">
              <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              <span className="text-sm">Loading projects...</span>
            </div>
          ) : dfurProjects && dfurProjects.length > 0 ? (
            dfurProjects.map((project) => {
              const approved = safeParseAmount(project.total_cost_approved);
              const incurred = safeParseAmount(project.total_cost_incurred);
              const pct = approved > 0 ? (incurred / approved) * 100 : 0;
              const pctDisplay = pct.toFixed(1);
              const barWidth = Math.min(pct, 100);

              return (
                <div key={project.id} className="p-4 hover:bg-violet-50/30 transition-colors">
                  {/* Project name + status badge on same row */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-slate-900 text-sm leading-tight flex-1">
                      {project.project}
                    </p>
                    <Badge className={`${statusColor(project.status)} shrink-0 text-xs`}>
                      {statusLabel(project.status)}
                    </Badge>
                  </div>

                  {/* Location */}
                  <p className="text-xs text-slate-500 mb-3 truncate">{project.location}</p>

                  {/* Costs row */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div>
                      <span className="text-slate-500 uppercase tracking-wide font-semibold">Approved</span>
                      <p className="font-bold text-slate-900 text-sm">{formatCurrency(approved)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 uppercase tracking-wide font-semibold">Incurred</span>
                      <p className="font-bold text-amber-600 text-sm">{formatCurrency(incurred)}</p>
                    </div>
                  </div>

                  {/* Utilization bar + % in one row */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${utilizationBarColor(pct)}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold min-w-[52px] justify-center shrink-0 ${utilizationBadgeColor(pct)}`}>
                      {pctDisplay}%
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-slate-500 text-sm">
              No projects data available
            </div>
          )}
        </div>

        {/* ── Desktop table (hidden below md) ── */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 backdrop-blur-sm border-b-2 border-slate-200">
              <tr className="text-xs uppercase text-slate-600">
                <th className="text-left py-4 px-6 font-bold">Project</th>
                <th className="text-left py-4 px-6 font-bold">Location</th>
                <th className="text-right py-4 px-6 font-bold">Approved</th>
                <th className="text-right py-4 px-6 font-bold">Incurred</th>
                <th className="text-center py-4 px-6 font-bold">Status / Utilization</th>
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
                dfurProjects.map((project) => {
                  const approved = safeParseAmount(project.total_cost_approved);
                  const incurred = safeParseAmount(project.total_cost_incurred);
                  const pct = approved > 0 ? (incurred / approved) * 100 : 0;
                  const pctDisplay = pct.toFixed(1);
                  const barWidth = Math.min(pct, 100);

                  return (
                    <tr
                      key={project.id}
                      className="border-b border-slate-100 hover:bg-violet-50/30 transition-all duration-200"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900 max-w-xs truncate" title={project.project}>
                        {project.project}
                      </td>
                      <td className="py-4 px-6 text-slate-600 max-w-xs truncate" title={project.location}>
                        {project.location}
                      </td>
                      <td className="text-right py-4 px-6 font-bold text-slate-900">
                        {formatCurrency(approved)}
                      </td>
                      <td className="text-right py-4 px-6 font-bold text-amber-600">
                        {formatCurrency(incurred)}
                      </td>
                      {/* Status badge + bar + % all in one row */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Badge className={`${statusColor(project.status)} shrink-0`}>
                            {statusLabel(project.status)}
                          </Badge>
                          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden shrink-0">
                            <div
                              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${utilizationBarColor(pct)}`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold w-[58px] justify-center shrink-0 ${utilizationBadgeColor(pct)}`}>
                            {pctDisplay}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
  );
}