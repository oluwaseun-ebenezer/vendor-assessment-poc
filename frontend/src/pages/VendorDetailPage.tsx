import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVendor } from "@/api/vendors";
import { useAssessmentResults, useRunAssessment, useAssessmentStatus } from "@/api/assessments";
import { useTasks, useUpdateTask } from "@/api/tasks";
import { apiClient } from "@/api/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RiskFlagBadge } from "@/components/shared/RiskFlagBadge";
import { formatDate, formatScore, getScoreColor } from "@/lib/utils";
import { DIMENSION_INFO } from "@/lib/constants";
import {
  Play, FileText, Loader2, ChevronDown, ChevronUp,
  CheckCircle2, Circle, ArrowLeft, Building2,
  ShieldCheck, TrendingUp, Globe, Scale, DollarSign,
  Settings, Layers, Star,
} from "lucide-react";

const DIMENSION_ICONS: Record<string, React.ElementType> = {
  security: ShieldCheck, viability: TrendingUp, integration: Layers,
  legal: Scale, commercial: DollarSign, operations: Settings,
  scalability: Globe, maturity: Star,
};

const TABS = ["Overview", "Assessment", "Tasks", "Documents"] as const;
type Tab = typeof TABS[number];

function ScoreRing({ score, flag }: { score: number; flag: string }) {
  const color = flag === "green" ? "#10b981" : flag === "amber" ? "#f59e0b" : "#ef4444";
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="text-center">
        <p className="text-xl font-bold text-gray-900">{score.toFixed(0)}</p>
        <p className="text-xs text-gray-400">/ 100</p>
      </div>
    </div>
  );
}

function DimensionCard({ dimension }: { dimension: any }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = DIMENSION_ICONS[dimension.dimension] || ShieldCheck;
  const info = DIMENSION_INFO[dimension.dimension as keyof typeof DIMENSION_INFO];
  const color = dimension.risk_flag === "green" ? "border-emerald-200 bg-emerald-50"
    : dimension.risk_flag === "amber" ? "border-amber-200 bg-amber-50"
    : "border-red-200 bg-red-50";
  const iconColor = dimension.risk_flag === "green" ? "text-emerald-600"
    : dimension.risk_flag === "amber" ? "text-amber-600" : "text-red-600";

  return (
    <div className={`border rounded-xl overflow-hidden ${color}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 ${iconColor}`}><Icon className="h-5 w-5" /></div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{info?.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{info?.owner}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-lg font-bold ${getScoreColor(dimension.composite_score)}`}>
              {formatScore(dimension.composite_score)}
            </span>
            <RiskFlagBadge flag={dimension.risk_flag} />
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-3 bg-white/50 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              dimension.risk_flag === "green" ? "bg-emerald-500"
              : dimension.risk_flag === "amber" ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${dimension.composite_score}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Rules {dimension.rules_score?.toFixed(0)}%</span>
          <span>LLM {dimension.llm_score?.toFixed(0)}%</span>
        </div>
      </div>

      {dimension.llm_reasoning && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-4 py-2 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 border-t border-white/50 bg-white/30 hover:bg-white/50 transition-colors"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Hide" : "Show"} LLM reasoning
          </button>
          {expanded && (
            <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-white/50 pt-3">
              {dimension.llm_reasoning}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ApproveModal({ vendorId, onClose }: { vendorId: string; onClose: () => void }) {
  const [decision, setDecision] = useState<"cleared" | "rejected">("cleared");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiClient.post(`/vendors/${vendorId}/approve`, { decision, reason });
      navigate("/dashboard");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Final Decision</h3>
        <div className="flex gap-3 mb-4">
          {(["cleared", "rejected"] as const).map(d => (
            <button
              key={d}
              onClick={() => setDecision(d)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                decision === d
                  ? d === "cleared" ? "bg-emerald-500 border-emerald-500 text-white" : "bg-red-500 border-red-500 text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {d === "cleared" ? "✅ Clear Vendor" : "❌ Reject Vendor"}
            </button>
          ))}
        </div>
        <textarea
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4002A]/20 focus:border-[#D4002A] resize-none"
          rows={4}
          placeholder="Reason for decision (required for audit trail)..."
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!reason || loading}
            className="bg-[#D4002A] hover:bg-[#b0001f] disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Submitting..." : "Confirm Decision"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [showApprove, setShowApprove] = useState(false);

  const { data: vendor, isLoading } = useVendor(id);
  const { data: assessmentResults, refetch: refetchResults } = useAssessmentResults(id);
  const { data: assessmentStatus } = useAssessmentStatus(id);
  const { data: tasks } = useTasks({ vendor_id: id });
  const updateTask = useUpdateTask();
  const runAssessment = useRunAssessment();

  if (isLoading || !vendor) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
        </div>
      </AppLayout>
    );
  }

  const isAssessing = assessmentStatus?.status === "pending" || assessmentStatus?.status === "running";
  const assessment = assessmentResults?.assessment;
  const dimensions = assessmentResults?.dimension_scores || [];

  const handleRunAssessment = async () => {
    if (id) {
      await runAssessment.mutateAsync(id);
      setTimeout(() => refetchResults(), 15000);
    }
  };

  const handleDownloadPDF = async () => {
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
  };

  return (
    <AppLayout>
      {showApprove && id && <ApproveModal vendorId={id} onClose={() => setShowApprove(false)} />}

      <div className="space-y-6 max-w-6xl">
        {/* Back */}
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to pipeline
        </button>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#1C1C2E] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {vendor.company_name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{vendor.company_name}</h1>
                <p className="text-gray-500 text-sm mt-1 max-w-xl">{vendor.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <StatusBadge status={vendor.status} />
                  {assessment && <RiskFlagBadge flag={assessment.risk_flag ?? undefined} />}
                  {vendor.country && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      <Globe className="h-3 w-3" />{vendor.country}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {assessment && (
              <div className="flex-shrink-0">
                <ScoreRing score={assessment.composite_score || 0} flag={assessment.risk_flag || "red"} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-5 pt-5 border-t border-gray-100">
            <button
              onClick={handleRunAssessment}
              disabled={isAssessing}
              className="flex items-center gap-2 bg-[#1C1C2E] hover:bg-[#2d2d42] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {isAssessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Assessing...</>
                : <><Play className="h-4 w-4" /> Run Assessment</>}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <FileText className="h-4 w-4" /> Download PDF
            </button>
            {(vendor.status === "in_review" || vendor.status === "submitted") && (
              <button
                onClick={() => setShowApprove(true)}
                className="flex items-center gap-2 bg-[#D4002A] hover:bg-[#b0001f] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors ml-auto"
              >
                Make Decision
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab ? "bg-[#D4002A] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
              {tab === "Tasks" && tasks && tasks.length > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === "Tasks" ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
                  {tasks.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" /> Company Details
              </h3>
              <dl className="space-y-3 text-sm">
                {[
                  ["Website", vendor.website],
                  ["Country", vendor.country],
                  ["Founded", vendor.founded_year],
                  ["Employees", vendor.employee_count],
                  ["Submitted", formatDate(vendor.created_at)],
                ].map(([k, v]) => v ? (
                  <div key={k as string} className="flex justify-between">
                    <dt className="text-gray-500">{k}</dt>
                    <dd className="font-medium text-gray-900 text-right">{v as string}</dd>
                  </div>
                ) : null)}
              </dl>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Technology Stack</h3>
              {vendor.tech_stack && vendor.tech_stack.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {vendor.tech_stack.map((t: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-[#1C1C2E] text-white text-xs rounded-lg font-mono">{t}</span>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-sm">No tech stack provided</p>}
            </div>
          </div>
        )}

        {activeTab === "Assessment" && (
          <div>
            {dimensions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dimensions.map((d: any) => <DimensionCard key={d.id} dimension={d} />)}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
                <Play className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium">No assessment yet</p>
                <p className="text-gray-300 text-xs mt-1">Run an assessment to see dimension scores</p>
                <button onClick={handleRunAssessment} disabled={isAssessing}
                  className="mt-4 bg-[#D4002A] hover:bg-[#b0001f] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  {isAssessing ? "Running..." : "Run Assessment"}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "Tasks" && (
          <div className="space-y-3">
            {tasks && tasks.length > 0 ? tasks.map((task: any) => (
              <div key={task.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-4">
                <button onClick={() => updateTask.mutateAsync({ taskId: task.id, status: task.status === "done" ? "open" : "done" })}>
                  {task.status === "done"
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                    : <Circle className="h-5 w-5 text-gray-300 mt-0.5 hover:text-gray-500" />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-gray-400" : "text-gray-900"}`}>{task.title}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{task.department}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      task.priority === "high" ? "bg-red-100 text-red-700"
                      : task.priority === "medium" ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-500"}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                {task.status !== "done" && (
                  <button onClick={() => updateTask.mutateAsync({ taskId: task.id, status: "in_progress" })}
                    className="text-xs text-[#D4002A] hover:underline font-medium">
                    Start
                  </button>
                )}
              </div>
            )) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <CheckCircle2 className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No action items yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "Documents" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            {vendor.documents && vendor.documents.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {vendor.documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-[#D4002A]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                        <p className="text-xs text-gray-400">{doc.doc_type} · {formatDate(doc.uploaded_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No documents uploaded</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
