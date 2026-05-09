import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVendors, useCreateVendor } from "@/api/vendors";
import { useRunAssessment } from "@/api/assessments";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RiskFlagBadge } from "@/components/shared/RiskFlagBadge";
import { formatDate, formatScore } from "@/lib/utils";
import { VendorFilters, VendorStatus, RiskFlag } from "@/types";
import {
  Search, Plus, Building2, CheckCircle, Clock, XCircle,
  ChevronRight, Play, Loader2,
} from "lucide-react";

function StatCard({
  label, value, sub, color, icon: Icon,
}: {
  label: string; value: string | number; sub?: string;
  color: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

function SubmitVendorModal({ onClose }: { onClose: () => void }) {
  const createVendor = useCreateVendor();
  const runAssessment = useRunAssessment();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    company_name: "", website: "", country: "", founded_year: "",
    employee_count: "", description: "", funding_stage: "",
    deployment_method: "SaaS", cloud_provider: "",
    iso27001: false, soc2: false, gdpr_dpa: false,
    pen_test: false, security_breach: false, eu_data_residency: false,
    ip_ownership_documented: false, pending_litigation: false,
    business_continuity_plan: false, in_production: false,
    enterprise_customers: false, sla_uptime: "", api_docs_available: false,
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const vendor = await createVendor.mutateAsync({
        ...form,
        founded_year: form.founded_year ? parseInt(form.founded_year) : undefined,
        employee_count: form.employee_count ? parseInt(form.employee_count) : undefined,
      });
      await runAssessment.mutateAsync(vendor.id);
      navigate(`/vendors/${vendor.id}`);
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4002A]/20 focus:border-[#D4002A]";
  const labelCls = "block text-xs font-medium text-gray-600 mb-1";
  const checkCls = "flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Submit New Vendor</h2>
            <p className="text-xs text-gray-500 mt-0.5">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {["Company Info", "Security & Legal", "Review"].map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full transition-colors ${step > i ? "bg-[#D4002A]" : "bg-gray-100"}`} />
                <p className={`text-xs mt-1 ${step === i + 1 ? "text-[#D4002A] font-medium" : "text-gray-400"}`}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Company Name *</label>
                  <input className={inputCls} value={form.company_name} onChange={e => set("company_name", e.target.value)} placeholder="Acme AI Ltd" />
                </div>
                <div>
                  <label className={labelCls}>Website</label>
                  <input className={inputCls} value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://acme.ai" />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <input className={inputCls} value={form.country} onChange={e => set("country", e.target.value)} placeholder="Denmark" />
                </div>
                <div>
                  <label className={labelCls}>Founded Year</label>
                  <input className={inputCls} type="number" value={form.founded_year} onChange={e => set("founded_year", e.target.value)} placeholder="2021" />
                </div>
                <div>
                  <label className={labelCls}>Employees</label>
                  <input className={inputCls} type="number" value={form.employee_count} onChange={e => set("employee_count", e.target.value)} placeholder="25" />
                </div>
                <div>
                  <label className={labelCls}>Funding Stage</label>
                  <select className={inputCls} value={form.funding_stage} onChange={e => set("funding_stage", e.target.value)}>
                    <option value="">Select...</option>
                    {["pre-seed","seed","Series A","Series B","growth","public"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Deployment</label>
                  <select className={inputCls} value={form.deployment_method} onChange={e => set("deployment_method", e.target.value)}>
                    {["SaaS","On-premise","Hybrid"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Description</label>
                  <textarea className={inputCls} rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="What does this vendor do and how will Carlsberg use them?" />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Security & Compliance</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { k: "iso27001", label: "ISO 27001 Certified" },
                    { k: "soc2", label: "SOC 2 Type II" },
                    { k: "gdpr_dpa", label: "GDPR DPA Signed" },
                    { k: "pen_test", label: "Pen Test (12 months)" },
                    { k: "security_breach", label: "Security Breach Disclosed" },
                    { k: "eu_data_residency", label: "EU Data Residency" },
                  ].map(({ k, label }) => (
                    <label key={k} className={checkCls}>
                      <input type="checkbox" checked={form[k as keyof typeof form] as boolean}
                        onChange={e => set(k, e.target.checked)}
                        className="w-4 h-4 accent-[#D4002A]" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Legal & Commercial</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { k: "ip_ownership_documented", label: "IP Ownership Documented" },
                    { k: "pending_litigation", label: "Pending Litigation" },
                    { k: "business_continuity_plan", label: "BCP in Place" },
                    { k: "in_production", label: "In Production" },
                    { k: "enterprise_customers", label: "Enterprise Customers" },
                    { k: "api_docs_available", label: "API Docs Available" },
                  ].map(({ k, label }) => (
                    <label key={k} className={checkCls}>
                      <input type="checkbox" checked={form[k as keyof typeof form] as boolean}
                        onChange={e => set(k, e.target.checked)}
                        className="w-4 h-4 accent-[#D4002A]" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Uptime SLA</label>
                <input className={inputCls} value={form.sla_uptime} onChange={e => set("sla_uptime", e.target.value)} placeholder="99.9%" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Company</span><span className="font-medium">{form.company_name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Country</span><span>{form.country || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Employees</span><span>{form.employee_count || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Funding</span><span>{form.funding_stage || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">ISO 27001</span><span>{form.iso27001 ? "✅ Yes" : "❌ No"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">SOC 2</span><span>{form.soc2 ? "✅ Yes" : "❌ No"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">GDPR DPA</span><span>{form.gdpr_dpa ? "✅ Yes" : "❌ No"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Pending Litigation</span><span>{form.pending_litigation ? "⚠️ Yes" : "✅ No"}</span></div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <strong>Next:</strong> After submission, the 8-dimension scoring engine will automatically run and generate a risk report. You'll be redirected to the vendor detail page.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            {step > 1 ? "← Back" : "Cancel"}
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && !form.company_name}
              className="bg-[#D4002A] hover:bg-[#b0001f] disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#D4002A] hover:bg-[#b0001f] disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><Play className="h-4 w-4" /> Submit & Run Assessment</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<VendorFilters>({ page: 1, size: 20 });
  const [showModal, setShowModal] = useState(false);
  const { data: vendors, isLoading } = useVendors(filters);

  const total = vendors?.length || 0;
  const cleared = vendors?.filter(v => v.status === "cleared").length || 0;
  const inReview = vendors?.filter(v => v.status === "in_review").length || 0;
  const rejected = vendors?.filter(v => v.status === "rejected").length || 0;

  return (
    <AppLayout>
      {showModal && <SubmitVendorModal onClose={() => setShowModal(false)} />}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Pipeline</h1>
            <p className="text-sm text-gray-500 mt-0.5">AI-powered vendor risk assessment</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#D4002A] hover:bg-[#b0001f] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Submit Vendor
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Vendors" value={total} color="bg-[#1C1C2E]" icon={Building2} />
          <StatCard label="Cleared" value={cleared} color="bg-emerald-500" icon={CheckCircle} sub="approved for use" />
          <StatCard label="In Review" value={inReview} color="bg-amber-500" icon={Clock} sub="assessment running" />
          <StatCard label="Rejected" value={rejected} color="bg-red-500" icon={XCircle} sub="not approved" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search vendors..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4002A]/20 focus:border-[#D4002A]"
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4002A]/20"
            onChange={e => setFilters(f => ({ ...f, status: (e.target.value as VendorStatus) || undefined }))}
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in_review">In Review</option>
            <option value="cleared">Cleared</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4002A]/20"
            onChange={e => setFilters(f => ({ ...f, risk_flag: (e.target.value as RiskFlag) || undefined }))}
          >
            <option value="">All Risk Levels</option>
            <option value="green">🟢 Green</option>
            <option value="amber">🟡 Amber</option>
            <option value="red">🔴 Red</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Company", "Country", "Status", "Risk", "Score", "Submitted", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
              ) : vendors && vendors.length > 0 ? vendors.map(vendor => (
                <tr
                  key={vendor.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/vendors/${vendor.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1C1C2E] flex items-center justify-center text-white text-xs font-bold">
                        {vendor.company_name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{vendor.company_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{vendor.country || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={vendor.status} /></td>
                  <td className="px-4 py-3"><RiskFlagBadge flag={vendor.risk_flag} /></td>
                  <td className="px-4 py-3">
                    {vendor.composite_score != null ? (
                      <span className="font-semibold text-sm text-gray-900">
                        {formatScore(vendor.composite_score)}
                        <span className="text-gray-400 font-normal">/100</span>
                      </span>
                    ) : <span className="text-gray-300 text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatDate(vendor.created_at)}</td>
                  <td className="px-4 py-3">
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Building2 className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm font-medium">No vendors yet</p>
                    <p className="text-gray-300 text-xs mt-1">Submit your first vendor to get started</p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="mt-4 text-[#D4002A] text-sm font-medium hover:underline"
                    >
                      + Submit Vendor
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
