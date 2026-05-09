import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects, useCreateProject, useUpdateProject, useArchiveProject } from "@/api/projects";
import { useProject } from "@/hooks/useProject";
import { AppLayout } from "@/components/layout/AppLayout";
import { Project, AIConfig } from "@/types";
import {
  FolderKanban, Plus, Settings, Archive, ArrowRight,
  Cpu, Loader2, X, ChevronDown, ChevronUp,
} from "lucide-react";

const DEFAULT_WEIGHTS = {
  security: 0.20, viability: 0.15, integration: 0.15,
  legal: 0.15, commercial: 0.10, operations: 0.10,
  scalability: 0.10, maturity: 0.05,
};

const AVAILABLE_MODELS = [
  { group: "— Free —", id: "", label: "" },
  { id: "openai/gpt-oss-20b:free",                 label: "GPT OSS 20B · Free (recommended)" },
  { id: "openai/gpt-oss-120b:free",                label: "GPT OSS 120B · Free" },
  { id: "nvidia/nemotron-3-super-120b-a12b:free",  label: "Nemotron 120B · Free" },
  { id: "minimax/minimax-m2.5:free",               label: "MiniMax M2.5 · Free" },
  { group: "— OpenAI —", id: "", label: "" },
  { id: "openai/gpt-4o",                           label: "GPT-4o" },
  { id: "openai/gpt-4o-mini",                      label: "GPT-4o Mini (fast)" },
  { id: "openai/gpt-4-turbo",                      label: "GPT-4 Turbo" },
  { group: "— Anthropic —", id: "", label: "" },
  { id: "anthropic/claude-sonnet-4.5",             label: "Claude Sonnet 4.5" },
  { id: "anthropic/claude-3.5-haiku",              label: "Claude 3.5 Haiku (fast)" },
  { id: "anthropic/claude-3-haiku",                label: "Claude 3 Haiku" },
  { id: "anthropic/claude-opus-4",                 label: "Claude Opus 4 (most capable)" },
  { group: "— Google —", id: "", label: "" },
  { id: "google/gemini-2.5-pro",                   label: "Gemini 2.5 Pro" },
  { id: "google/gemini-2.5-flash",                 label: "Gemini 2.5 Flash (fast)" },
  { id: "google/gemini-2.0-flash-001",             label: "Gemini 2.0 Flash" },
  { group: "— Meta / Mistral / DeepSeek —", id: "", label: "" },
  { id: "meta-llama/llama-3.3-70b-instruct",       label: "Llama 3.3 70B" },
  { id: "meta-llama/llama-3.1-8b-instruct",        label: "Llama 3.1 8B (fast)" },
  { id: "mistralai/mistral-medium-3",              label: "Mistral Medium 3" },
  { id: "mistralai/mistral-small-3.2-24b-instruct",label: "Mistral Small 3.2" },
  { id: "deepseek/deepseek-chat",                  label: "DeepSeek Chat" },
  { id: "deepseek/deepseek-r1",                    label: "DeepSeek R1 (reasoning)" },
];

const DIMENSION_LABELS: Record<string, string> = {
  security: "Security & Compliance",
  viability: "Vendor Viability",
  integration: "Integration",
  legal: "Legal & IP",
  commercial: "Commercial",
  operations: "Operations",
  scalability: "Scalability",
  maturity: "Product Maturity",
};

function ProjectModal({
  project,
  onClose,
}: {
  project?: Project;
  onClose: () => void;
}) {
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const existingWeights = project?.ai_config?.dimension_weights || {};
  const [form, setForm] = useState({
    name: project?.name || "",
    description: project?.description || "",
    model: project?.ai_config?.model || "google/gemma-4-31b-it:free",
    temperature: project?.ai_config?.temperature ?? 0.2,
    system_prompt: project?.ai_config?.system_prompt || "",
    weights: { ...DEFAULT_WEIGHTS, ...existingWeights },
  });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const setWeight = (dim: string, val: number) =>
    setForm(f => ({ ...f, weights: { ...f.weights, [dim]: val } }));

  const weightTotal = Object.values(form.weights).reduce((a, b) => a + b, 0);
  const weightsValid = Math.abs(weightTotal - 1.0) < 0.005;

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        ai_config: {
          model: form.model,
          temperature: form.temperature,
          system_prompt: form.system_prompt,
          dimension_weights: form.weights,
        },
      };
      if (project) {
        await updateProject.mutateAsync({ id: project.id, data: payload });
      } else {
        await createProject.mutateAsync(payload);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4002A]/20 focus:border-[#D4002A]";
  const labelCls = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {project ? "Edit Project" : "New Project"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Basic info */}
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Project Name *</label>
              <input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="FMCG Supply Chain AI 2026" autoFocus />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={2} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Purpose and scope of this vendor assessment project" />
            </div>
          </div>

          {/* AI Config */}
          <div className="bg-[#1C1C2E] rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#D4002A]" />
              <span className="text-sm font-semibold text-white">AI Model Configuration</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-white/60 mb-1">Model</label>
                <select
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:border-[#D4002A]"
                  value={form.model}
                  onChange={e => set("model", e.target.value)}
                >
                  {AVAILABLE_MODELS.map((m, i) =>
                    m.group ? (
                      <option key={i} disabled className="text-gray-400 bg-gray-100">{m.group}</option>
                    ) : (
                      <option key={m.id} value={m.id} className="text-black bg-white">{m.label}</option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">
                  Temperature: <span className="text-white">{form.temperature}</span>
                </label>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={form.temperature}
                  onChange={e => set("temperature", parseFloat(e.target.value))}
                  className="w-full accent-[#D4002A]"
                />
                <div className="flex justify-between text-xs text-white/30 mt-0.5">
                  <span>Precise</span><span>Creative</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">
                System Prompt <span className="font-normal opacity-60">(appended to all scorer prompts)</span>
              </label>
              <textarea
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4002A] resize-none"
                rows={3}
                value={form.system_prompt}
                onChange={e => set("system_prompt", e.target.value)}
                placeholder="e.g. Focus on FMCG supply chain risk. Penalise vendors without EU data residency..."
              />
            </div>

            {/* Dimension weights */}
            <div>
              <button
                onClick={() => setShowAdvanced(a => !a)}
                className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
              >
                {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                Dimension Weights
                <span className={`ml-2 text-xs ${weightsValid ? "text-emerald-400" : "text-red-400"}`}>
                  (sum: {weightTotal.toFixed(2)}{weightsValid ? " ✓" : " — must equal 1.0"})
                </span>
              </button>
              {showAdvanced && (
                <div className="mt-3 space-y-2">
                  {Object.entries(form.weights).map(([dim, val]) => (
                    <div key={dim} className="flex items-center gap-3">
                      <span className="text-xs text-white/60 w-36 flex-shrink-0">{DIMENSION_LABELS[dim] || dim}</span>
                      <input
                        type="range" min="0" max="0.5" step="0.01"
                        value={val}
                        onChange={e => setWeight(dim, parseFloat(e.target.value))}
                        className="flex-1 accent-[#D4002A]"
                      />
                      <span className="text-xs text-white w-8 text-right">{(val * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!form.name || saving || !weightsValid}
            className="flex items-center gap-2 bg-[#D4002A] hover:bg-[#b0001f] disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : project ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, onSelect, onEdit }: { project: Project; onSelect: () => void; onEdit: () => void }) {
  const archiveProject = useArchiveProject();
  const cfg = project.ai_config || {} as AIConfig;
  const modelShort = cfg.model?.split("/").pop()?.replace(":free", "") || "default";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1C1C2E] flex items-center justify-center flex-shrink-0">
            <FolderKanban className="h-5 w-5 text-[#D4002A]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{project.name}</h3>
            {project.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{project.description}</p>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${project.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
          {project.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400">Vendors</p>
          <p className="font-bold text-gray-900 text-base">{project.vendor_count}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400">AI Model</p>
          <p className="font-semibold text-gray-700 truncate" title={cfg.model}>{modelShort}</p>
        </div>
      </div>

      {cfg.system_prompt && (
        <p className="text-xs text-gray-400 italic line-clamp-1 mb-4">"{cfg.system_prompt}"</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={onSelect}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#D4002A] hover:bg-[#b0001f] text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <ArrowRight className="h-3.5 w-3.5" />Open
        </button>
        <button onClick={onEdit} className="p-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-gray-500">
          <Settings className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => archiveProject.mutate(project.id)}
          className="p-2 border border-gray-200 rounded-lg hover:border-red-200 hover:text-red-500 transition-colors text-gray-400"
          title="Archive"
        >
          <Archive className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const { setCurrentProject } = useProject();
  const { data: projects, isLoading } = useProjects();
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const active = projects?.filter(p => p.status === "active") || [];
  const archived = projects?.filter(p => p.status === "archived") || [];

  return (
    <AppLayout>
      {showCreate && <ProjectModal onClose={() => setShowCreate(false)} />}
      {editProject && <ProjectModal project={editProject} onClose={() => setEditProject(null)} />}

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Group vendors by initiative — each with its own AI model and scoring configuration
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#D4002A] hover:bg-[#b0001f] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />New Project
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-52 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : active.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
            <FolderKanban className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-gray-500 font-medium">No projects yet</h3>
            <p className="text-gray-400 text-sm mt-1">Create a project to organise vendors and configure AI scoring per initiative</p>
            <button onClick={() => setShowCreate(true)} className="mt-4 bg-[#D4002A] hover:bg-[#b0001f] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
              + Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                onSelect={() => { setCurrentProject(p); navigate("/dashboard"); }}
                onEdit={() => setEditProject(p)}
              />
            ))}
          </div>
        )}

        {archived.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Archived</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
              {archived.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onSelect={() => { setCurrentProject(p); navigate("/dashboard"); }}
                  onEdit={() => setEditProject(p)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
