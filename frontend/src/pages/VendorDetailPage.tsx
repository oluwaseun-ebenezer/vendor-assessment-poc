import { useParams } from "react-router-dom";
import { useVendor } from "@/api/vendors";
import {
  useAssessmentResults,
  useRunAssessment,
  useAssessmentStatus,
} from "@/api/assessments";
import { useTasks } from "@/api/tasks";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RiskFlagBadge } from "@/components/shared/RiskFlagBadge";
import { Badge } from "@/components/ui/badge";
import { formatScore, formatDate, getScoreColor } from "@/lib/utils";
import { DIMENSION_INFO } from "@/lib/constants";
import { Play, FileText, Loader2 } from "lucide-react";

export function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: vendor, isLoading: vendorLoading } = useVendor(id);
  const { data: assessmentResults } = useAssessmentResults(id);
  const { data: assessmentStatus } = useAssessmentStatus(id);
  const { data: tasks } = useTasks({ vendor_id: id });
  const runAssessment = useRunAssessment();

  if (vendorLoading || !vendor) {
    return (
      <AppLayout>
        <div className="text-center py-8">Loading vendor details...</div>
      </AppLayout>
    );
  }

  const isAssessing =
    assessmentStatus?.status === "pending" ||
    assessmentStatus?.status === "running";

  const handleRunAssessment = async () => {
    if (id) {
      await runAssessment.mutateAsync(id);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {vendor.company_name}
              </h1>
              <p className="text-gray-600 mt-2">{vendor.description}</p>
              <div className="flex gap-4 mt-4">
                <StatusBadge status={vendor.status} />
                {assessmentResults && (
                  <RiskFlagBadge flag={assessmentResults.assessment.risk_flag ?? undefined} />
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRunAssessment} disabled={isAssessing}>
                {isAssessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assessing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Assessment
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const token = localStorage.getItem("access_token");
                  const res = await fetch(`/api/reports/${id}/pdf`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (res.ok) {
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${vendor.company_name}-report.pdf`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Website:</span>
                <span className="font-medium">{vendor.website || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Country:</span>
                <span className="font-medium">{vendor.country || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Founded:</span>
                <span className="font-medium">
                  {vendor.founded_year || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Employees:</span>
                <span className="font-medium">
                  {vendor.employee_count || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span className="font-medium">
                  {formatDate(vendor.created_at)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card>
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.tech_stack && vendor.tech_stack.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {vendor.tech_stack.map((tech, index) => (
                    <Badge key={index} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No tech stack information</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assessment Scores */}
        {assessmentResults && (
          <Card>
            <CardHeader>
              <CardTitle>Assessment Results</CardTitle>
              <CardDescription>
                Overall Score:{" "}
                {formatScore(assessmentResults.assessment.composite_score)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {assessmentResults.dimension_scores.map((dimension) => (
                  <Card key={dimension.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        {DIMENSION_INFO[dimension.dimension].label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-2xl font-bold ${getScoreColor(dimension.composite_score)}`}
                        >
                          {formatScore(dimension.composite_score)}
                        </span>
                        <RiskFlagBadge flag={dimension.risk_flag} />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {DIMENSION_INFO[dimension.dimension].owner}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks */}
        {tasks && tasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Action Items ({tasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex justify-between items-center p-3 border rounded"
                  >
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.department}</p>
                    </div>
                    <Badge
                      variant={task.status === "done" ? "default" : "secondary"}
                    >
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {vendor.documents && vendor.documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Documents ({vendor.documents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {vendor.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex justify-between items-center p-3 border rounded"
                  >
                    <div>
                      <p className="font-medium">{doc.filename}</p>
                      <p className="text-sm text-gray-600">{doc.doc_type}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(doc.uploaded_at)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
