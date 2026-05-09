import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useVendors, useCreateVendor, useUploadDocument, lookupVendor } from "@/api/vendors";
import { useRunAssessment } from "@/api/assessments";
import { useProject } from "@/hooks/useProject";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RiskFlagBadge } from "@/components/shared/RiskFlagBadge";
import { formatDate, formatScore } from "@/lib/utils";
import { VendorFilters, VendorStatus, RiskFlag } from "@/types";
import {
  Search, Plus, Building2, CheckCircle, Clock, XCircle,
  ChevronRight, Play, Loader2, Upload, FileText, X,
  Sparkles, Globe, AlertCircle,
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

const DOC_TYPES = [
  { value: "security_whitepaper", label: "Security Whitepaper" },
  { value: "legal_doc", label: "Legal / MSA Document" },
  { value: "financial_doc", label: "Financial Document" },
  { value: "architecture_doc", label: "Architecture Document" },
  { value: "other", label: "Other" },
];

interface DocFile { file: File; docType: string; }

const EMPTY_FORM = {
  company_name: "", website: "", country: "", founded_year: "",
  employee_count: "", description: "", funding_stage: "",
  deployment_method: "SaaS", cloud_provider: "", sla_uptime: "",
  iso27001: false, soc2: false, gdpr_dpa: false, pen_test: false,
  security_breach: false, eu_data_residency: false,
  ip_ownership_documented: false, pending_litigation: false,
  business_continuity_plan: false, in_production: false,
  enterprise_customers: false, enterprise_pricing: false,
  api_docs_available: false, multi_region: false,
};

function SubmitVendorModal({ onClose }: { onClose: () => void }) {
  const createVendor = useCreateVendor();
  const uploadDocument = useUploadDocument();
  const runAssessment = useRunAssessment();
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [looking, setLooking] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupNotes, setLookupNotes] = useState("");
  const [lookupConfidence, setLookupConfidence] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [pendingDocType, setPendingDocType] = useState("legal_doc");
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleLookup = async () => {
    if (!query.trim()) return;
    setLooking(true);
    setLookupError("");
    try {
      const data = await lookupVendor(query.trim());
      setForm({
        company_name: data.company_name || "",
        website: data.website || "",
        country: data.country || "",
        founded_year: data.founded_year ? String(data.founded_year) : "",
        employee_count: data.employee_count ? String(data.employee_count) : "",
        description: data.description || "",
        funding_stage: data.funding_stage || "",
        deployment_method: data.deployment_method || "SaaS",
        cloud_provider: data.cloud_provider || "",
        sla_uptime: data.sla_uptime || "",
        iso27001: !!data.iso27001,
        soc2: !!data.soc2,
        gdpr_dpa: !!data.gdpr_dpa,
        pen_test: !!data.pen_test,
        security_breach: !!data.security_breach,
        eu_data_residency: !!data.eu_data_residency,
        ip_ownership_documented: !!data.ip_ownership_documented,
        pending_litigation: !!data.pending_litigation,
        business_continuity_plan: !!data.business_continuity_plan,
        in_production: !!data.in_production,
        enterprise_customers: !!data.enterprise_customers,
        enterprise_pricing: !!data.enterprise_pricing,
        api_docs_available: !!data.api_docs_available,
        multi_region: !!data.multi_region,
      });
      setLookupNotes(data.notes || "");
      setLookupConfidence(data.confidence || "");
      setStep(2);
    } catch {
      setLookupError("Lookup failed — please fill in details manually.");
      setStep(2);
    } finally {
      setLooking(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocs(prev => [...prev, ...files.map(f => ({ file: f, docType: pendingDocType }))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const vendor = await createVendor.mutateAsync({
        ...form,
        project_id: currentProject?.id || undefined,
        founded_year: form.founded_year ? parseInt(form.founded_year) : undefined,
        employee_count: form.employee_count ? parseInt(form.employee_count) : undefined,
      });
      for (let i = 0; i < docs.length; i++) {
        setUploadProgress(`Uploading document ${i + 1} of ${docs.length}...`);
        await uploadDocument.mutateAsync({ vendorId: vendor.id, file: docs[i].file, docType: docs[i].docType });
      }
      setUploadProgress("Starting assessment...");
      await runAssessment.mutateAsync(vendor.id);
      navigate(`/vendors/${vendor.id}`);
      onClose();
    } catch {
      setSubmitting(false);
      setUploadProgress("");
    }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4002A]/20 focus:border-[#D4002A]";
  const labelCls = "block text-xs font-medium text-gray-600 mb-1";
  const checkCls = "flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none";
  const STEPS = ["Identify", "Confirm & Documents", "Review"];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Submit New Vendor</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Step {step} of {STEPS.length}
              {currentProject && (
                <span className="ml-2 text-[#D4002A] font-medium">→ {currentProject.name}</span>
              )}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full transition-colors ${step > i ? "bg-[#D4002A]" : "bg-gray-100"}`} />
                <p className={`text-xs mt-1 ${step === i + 1 ? "text-[#D4002A] font-medium" : "text-gray-400"}`}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* ── STEP 1: Identify ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="bg-[#1C1C2E] rounded-xl p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-[#D4002A]" />
                  <span className="text-sm font-semibold">AI-Powered Lookup</span>
                </div>
                <p className="text-white/60 text-xs leading-relaxed">
                  Enter a website URL or company name. Our AI will research the vendor and pre-fill all assessment fields — you just confirm and submit.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Vendor URL or Company Name
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4002A]/20 focus:border-[#D4002A]"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !looking && query.trim() && handleLookup()}
                      placeholder="https://acme.ai  or  Acme AI Ltd"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleLookup}
                    disabled={!query.trim() || looking}
                    className="flex items-center gap-2 bg-[#D4002A] hover:bg-[#b0001f] disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                  >
                    {looking
                      ? <><Loader2 className="h-4 w-4 animate-spin" />Looking up...</>
                      : <><Sparkles className="h-4 w-4" />Look up</>}
                  </button>
                </div>
                {lookupError && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{lookupError}
                  </p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-gray-400">or fill in manually</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Company Name *</label>
                  <input className={inputCls} value={form.company_name} onChange={e => set("company_name", e.target.value)} placeholder="Acme AI Ltd" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
                  <input className={inputCls} value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://acme.ai" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
                  <input className={inputCls} value={form.country} onChange={e => set("country", e.target.value)} placeholder="DK" />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Confirm & Documents ── */}
          {step === 2 && (
            <div className="space-y-5">
              {/* AI confidence badge */}
              {lookupConfidence && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                  lookupConfidence === "high" ? "bg-emerald-50 text-emerald-700"
                  : lookupConfidence === "medium" ? "bg-amber-50 text-amber-700"
                  : "bg-gray-50 text-gray-600"
                }`}>
                  <Sparkles className="h-3 w-3" />
                  AI prefilled — confidence: <strong>{lookupConfidence}</strong>
                  <span className="ml-1 font-normal opacity-70">· Review and correct any fields below</span>
                </div>
              )}
              {lookupNotes && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-700">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {lookupNotes}
                </div>
              )}

              {/* Company info */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Company</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={labelCls}>Company Name *</label>
                    <input className={inputCls} value={form.company_name} onChange={e => set("company_name", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Website</label>
                    <input className={inputCls} value={form.website} onChange={e => set("website", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Country (ISO)</label>
                    <input className={inputCls} value={form.country} onChange={e => set("country", e.target.value)} placeholder="DK" />
                  </div>
                  <div>
                    <label className={labelCls}>Founded Year</label>
                    <input className={inputCls} type="number" value={form.founded_year} onChange={e => set("founded_year", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Employees</label>
                    <input className={inputCls} type="number" value={form.employee_count} onChange={e => set("employee_count", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Funding Stage</label>
                    <select className={inputCls} value={form.funding_stage} onChange={e => set("funding_stage", e.target.value)}>
                      <option value="">Unknown</option>
                      {["pre-seed","seed","Series A","Series B","Series C","growth","public","bootstrapped"].map(s => <option key={s} value={s}>{s}</option>)}
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
                    <textarea className={inputCls} rows={2} value={form.description} onChange={e => set("description", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Security & Legal */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Security, Legal & Commercial</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { k: "iso27001", label: "ISO 27001" },
                    { k: "soc2", label: "SOC 2 Type II" },
                    { k: "gdpr_dpa", label: "GDPR DPA Signed" },
                    { k: "pen_test", label: "Pen Test Done" },
                    { k: "eu_data_residency", label: "EU Data Residency" },
                    { k: "in_production", label: "In Production" },
                    { k: "enterprise_customers", label: "Enterprise Customers" },
                    { k: "enterprise_pricing", label: "Enterprise Pricing" },
                    { k: "api_docs_available", label: "API Docs Available" },
                    { k: "multi_region", label: "Multi-Region" },
                    { k: "business_continuity_plan", label: "BCP in Place" },
                    { k: "pending_litigation", label: "Pending Litigation" },
                    { k: "security_breach", label: "Security Breach" },
                    { k: "ip_ownership_documented", label: "IP Ownership Documented" },
                  ].map(({ k, label }) => (
                    <label key={k} className={checkCls}>
                      <input type="checkbox" checked={!!form[k as keyof typeof form]}
                        onChange={e => set(k, e.target.checked)}
                        className="w-4 h-4 accent-[#D4002A]" />
                      <span className="text-xs">{label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <label className={labelCls}>Uptime SLA</label>
                  <input className={inputCls} value={form.sla_uptime} onChange={e => set("sla_uptime", e.target.value)} placeholder="99.9%" />
                </div>
              </div>

              {/* Documents */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Documents <span className="normal-case font-normal text-gray-400">(optional — improves LLM scoring)</span>
                </p>
                <div className="flex gap-2 mb-2">
                  <select className={`flex-1 text-xs ${inputCls}`} value={pendingDocType} onChange={e => setPendingDocType(e.target.value)}>
                    {DOC_TYPES.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
                  </select>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#1C1C2E] hover:bg-[#2d2d42] text-white text-xs font-medium rounded-lg transition-colors">
                    <Upload className="h-3.5 w-3.5" />Browse
                  </button>
                  <input ref={fileInputRef} type="file" multiple accept=".pdf,.txt,.docx,.doc,.png,.jpg" className="hidden" onChange={handleFileSelect} />
                </div>
                <div className="border-2 border-dashed border-gray-100 rounded-lg p-4 text-center cursor-pointer hover:border-[#D4002A]/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); setDocs(p => [...p, ...Array.from(e.dataTransfer.files).map(f => ({ file: f, docType: pendingDocType }))]); }}>
                  <p className="text-xs text-gray-400">Drop files or click Browse — PDF, TXT, DOCX</p>
                </div>
                {docs.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {docs.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <FileText className="h-3.5 w-3.5 text-[#D4002A] flex-shrink-0" />
                        <span className="text-xs text-gray-700 flex-1 truncate">{d.file.name}</span>
                        <select className="text-xs border border-gray-200 rounded px-1.5 py-0.5"
                          value={d.docType}
                          onChange={e => setDocs(p => p.map((x, j) => j === i ? { ...x, docType: e.target.value } : x))}>
                          {DOC_TYPES.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
                        </select>
                        <button onClick={() => setDocs(p => p.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: Review ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                {[
                  ["Company", form.company_name],
                  ["Website", form.website],
                  ["Country", form.country],
                  ["Employees", form.employee_count],
                  ["Funding", form.funding_stage],
                  ["Deployment", form.deployment_method],
                ].map(([k, v]) => v ? (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ) : null)}
                <div className="pt-2 border-t border-gray-200 grid grid-cols-2 gap-1 text-xs">
                  {[
                    ["ISO 27001", form.iso27001], ["SOC 2", form.soc2],
                    ["GDPR DPA", form.gdpr_dpa], ["Pen Test", form.pen_test],
                    ["EU Data Residency", form.eu_data_residency], ["In Production", form.in_production],
                    ["Pending Litigation", form.pending_litigation],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between">
                      <span className="text-gray-400">{k as string}</span>
                      <span>{v ? "✅" : "❌"}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                  <span className="text-gray-500">Documents</span>
                  <span>{docs.length > 0 ? `${docs.length} file${docs.length !== 1 ? "s" : ""}` : "None"}</span>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <strong>Next:</strong> Vendor created → documents uploaded → 8-dimension AI scoring runs automatically. You'll be redirected to the vendor detail page.
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

          {step === 1 && (
            <button
              onClick={() => form.company_name ? setStep(2) : handleLookup()}
              disabled={!query.trim() && !form.company_name || looking}
              className="bg-[#D4002A] hover:bg-[#b0001f] disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              {looking ? <><Loader2 className="h-4 w-4 animate-spin" />Looking up...</> : <>Continue →</>}
            </button>
          )}
          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              disabled={!form.company_name}
              className="bg-[#D4002A] hover:bg-[#b0001f] disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Continue →
            </button>
          )}
          {step === 3 && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#D4002A] hover:bg-[#b0001f] disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" />{uploadProgress || "Submitting..."}</>
                : <><Play className="h-4 w-4" />Submit & Run Assessment</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const [filters, setFilters] = useState<VendorFilters>({ page: 1, size: 20 });
  const [showModal, setShowModal] = useState(false);
  const { data: vendors, isLoading } = useVendors({
    ...filters,
    project_id: currentProject?.id,
  });

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
