import { useAnalytics } from "@/api/analytics";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Zap, Clock, CheckCircle, TrendingUp } from "lucide-react";

const DIMENSION_LABELS: Record<string, string> = {
  security: "Security", viability: "Viability", integration: "Integration",
  legal: "Legal & IP", commercial: "Commercial", operations: "Operations",
  scalability: "Scalability", maturity: "Maturity",
};

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export function MetricsPage() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading || !analytics) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-100 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
          </div>
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  const riskData = [
    { name: "Green", value: analytics.risk_distribution.green, color: "#10b981" },
    { name: "Amber", value: analytics.risk_distribution.amber, color: "#f59e0b" },
    { name: "Red", value: analytics.risk_distribution.red, color: "#ef4444" },
  ].filter(d => d.value > 0);

  const statusData = [
    { name: "Cleared", value: analytics.cleared_vendors, fill: "#10b981" },
    { name: "In Review", value: analytics.in_review_vendors, fill: "#f59e0b" },
    { name: "Rejected", value: analytics.rejected_vendors, fill: "#ef4444" },
  ];

  const efficiency = analytics.efficiency_gain_percentage;
  const avgDays = analytics.avg_time_to_onboard_days;
  const avgMins = analytics.avg_time_to_assess_hours * 60;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Metrics</h1>
          <p className="text-sm text-gray-500 mt-0.5">PoC validation — time reduction vs. manual baseline</p>
        </div>

        {/* Headline efficiency banner */}
        <div className="bg-[#1C1C2E] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-[#D4002A]/20 to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-[#D4002A]" />
              <span className="text-sm font-medium text-white/60 uppercase tracking-wide">Efficiency Gain</span>
            </div>
            <div className="flex items-end gap-8">
              <div>
                <p className="text-6xl font-bold text-white">{efficiency.toFixed(0)}%</p>
                <p className="text-white/50 text-sm mt-1">vs. 45-day manual baseline</p>
              </div>
              <div className="flex items-center gap-6 mb-2">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">45</div>
                  <div className="text-white/40 text-xs mt-0.5">days manual</div>
                </div>
                <div className="text-white/30 text-2xl font-light">→</div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">
                    {avgMins < 60 ? `${avgMins.toFixed(0)}m` : `${avgDays.toFixed(1)}d`}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">automated</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Vendors" value={String(analytics.total_vendors)} sub="in pipeline" icon={TrendingUp} color="bg-[#1C1C2E]" />
          <StatCard label="Avg Score" value={`${analytics.avg_composite_score.toFixed(1)}`} sub="composite risk score" icon={CheckCircle} color="bg-blue-500" />
          <StatCard label="Avg Assess Time" value={`${avgMins.toFixed(0)}m`} sub="from submit to report" icon={Clock} color="bg-amber-500" />
          <StatCard label="Clearance Rate" value={`${analytics.total_vendors > 0 ? ((analytics.cleared_vendors / analytics.total_vendors) * 100).toFixed(0) : 0}%`} sub="of assessed vendors" icon={CheckCircle} color="bg-emerald-500" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk distribution */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-1">Risk Distribution</h3>
            <p className="text-xs text-gray-400 mb-4">Vendors by risk flag</p>
            {riskData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={riskData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                      {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} vendors`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {riskData.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                      <span className="text-sm text-gray-600">{d.name}</span>
                      <span className="text-sm font-bold text-gray-900 ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No data yet</div>
            )}
          </div>

          {/* Status breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-1">Vendor Status</h3>
            <p className="text-xs text-gray-400 mb-4">Pipeline stage breakdown</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={statusData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
