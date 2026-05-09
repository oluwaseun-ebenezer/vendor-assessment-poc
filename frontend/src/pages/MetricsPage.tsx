import { useAnalytics } from "@/api/analytics";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";

export function MetricsPage() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading || !analytics) {
    return (
      <AppLayout>
        <div className="text-center py-8">Loading analytics...</div>
      </AppLayout>
    );
  }

  const riskData = [
    {
      name: "Green",
      value: analytics.risk_distribution.green,
      color: "#10b981",
    },
    {
      name: "Amber",
      value: analytics.risk_distribution.amber,
      color: "#f59e0b",
    },
    { name: "Red", value: analytics.risk_distribution.red, color: "#ef4444" },
  ];

  const statusData = [
    { name: "Cleared", value: analytics.cleared_vendors },
    { name: "In Review", value: analytics.in_review_vendors },
    { name: "Rejected", value: analytics.rejected_vendors },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Vendors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{analytics.total_vendors}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {analytics.avg_composite_score.toFixed(1)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Time to Assess
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {analytics.avg_time_to_assess_hours.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Time to Onboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {analytics.avg_time_to_onboard_days.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">days</p>
            </CardContent>
          </Card>
        </div>

        {/* Efficiency Gain */}
        <Card>
          <CardHeader>
            <CardTitle>Efficiency Gain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-5xl font-bold text-green-600">
                {analytics.efficiency_gain_percentage.toFixed(0)}%
              </p>
              <p className="text-gray-600 mt-2">
                vs. manual baseline (45 days)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vendor Status */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
