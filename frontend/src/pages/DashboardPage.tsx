import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVendors } from "@/api/vendors";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RiskFlagBadge } from "@/components/shared/RiskFlagBadge";
import { formatDate, formatScore } from "@/lib/utils";
import { VendorFilters, VendorStatus, RiskFlag } from "@/types";
import { Search, Plus } from "lucide-react";

export function DashboardPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<VendorFilters>({
    page: 1,
    size: 20,
  });

  const { data: vendors, isLoading } = useVendors(filters);

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search });
  };

  const handleStatusFilter = (status: VendorStatus | undefined) => {
    setFilters({ ...filters, status });
  };

  const handleRiskFilter = (risk_flag: RiskFlag | undefined) => {
    setFilters({ ...filters, risk_flag });
  };

  // Calculate stats
  const totalVendors = vendors?.length || 0;
  const clearedCount =
    vendors?.filter((v) => v.status === "cleared").length || 0;
  const inReviewCount =
    vendors?.filter((v) => v.status === "in_review").length || 0;
  const rejectedCount =
    vendors?.filter((v) => v.status === "rejected").length || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Pipeline</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Submit Vendor
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Vendors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalVendors}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cleared</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {clearedCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Review</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">
                {inReviewCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vendors..."
                  className="pl-10"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-md"
                onChange={(e) =>
                  handleStatusFilter(
                    (e.target.value as VendorStatus) || undefined,
                  )
                }
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="in_review">In Review</option>
                <option value="cleared">Cleared</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                className="px-4 py-2 border rounded-md"
                onChange={(e) =>
                  handleRiskFilter((e.target.value as RiskFlag) || undefined)
                }
              >
                <option value="">All Risk Levels</option>
                <option value="green">Green</option>
                <option value="amber">Amber</option>
                <option value="red">Red</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Vendors Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading vendors...</div>
            ) : vendors && vendors.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Flag</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow
                      key={vendor.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/vendors/${vendor.id}`)}
                    >
                      <TableCell className="font-medium">
                        {vendor.company_name}
                      </TableCell>
                      <TableCell>{vendor.country || "N/A"}</TableCell>
                      <TableCell>
                        <StatusBadge status={vendor.status} />
                      </TableCell>
                      <TableCell>
                        <RiskFlagBadge flag={vendor.risk_flag} />
                      </TableCell>
                      <TableCell>
                        {vendor.composite_score
                          ? formatScore(vendor.composite_score)
                          : "N/A"}
                      </TableCell>
                      <TableCell>{formatDate(vendor.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/vendors/${vendor.id}`);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No vendors found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
