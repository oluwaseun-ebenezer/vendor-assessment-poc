#!/usr/bin/env node
/**
 * Vendor Assessment MCP Server
 * Exposes the full vendor vetting workflow as MCP tools + resources.
 * AI agents (Cline / Claude Desktop) can orchestrate end-to-end vendor
 * risk assessment without any human UI interaction.
 */
import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { apiCall } from "./client.js";

// ─── Tool input schemas ───────────────────────────────────────────────────────

const SubmitVendorSchema = z.object({
  company_name: z.string().describe("Legal company name"),
  website: z.string().optional().describe("Company website URL"),
  country: z.string().optional().describe("Country of incorporation"),
  founded_year: z.number().optional(),
  employee_count: z.number().optional(),
  description: z.string().optional().describe("Product/service description"),
  tech_stack: z.array(z.string()).optional().describe("Technologies used"),
  contacts: z
    .array(z.object({ name: z.string(), email: z.string(), role: z.string() }))
    .optional(),
  iso27001: z.boolean().optional(),
  soc2: z.boolean().optional(),
  gdpr_dpa: z.boolean().optional(),
  security_breach: z.boolean().optional(),
  pen_test: z.boolean().optional(),
  data_residency: z.string().optional(),
  cloud_provider: z.string().optional(),
  api_docs_available: z.boolean().optional(),
  api_docs_url: z.string().optional(),
  sla_uptime: z.string().optional().describe("e.g. '99.9%'"),
  company_registration_number: z.string().optional(),
  company_registration_country: z.string().optional(),
  ip_ownership_documented: z.boolean().optional(),
  pending_litigation: z.boolean().optional(),
  open_source_licence_clean: z.boolean().optional(),
  pricing_model: z.string().optional(),
  annual_cost_estimate: z.string().optional(),
  enterprise_pricing: z.boolean().optional(),
  volume_discount: z.boolean().optional(),
  deployment_method: z.string().optional(),
  dedicated_csm: z.boolean().optional(),
  funding_stage: z.string().optional(),
  business_continuity_plan: z.boolean().optional(),
  in_production: z.boolean().optional(),
  enterprise_customers: z.boolean().optional(),
  product_roadmap_available: z.boolean().optional(),
  eu_data_residency: z.boolean().optional(),
  multi_region: z.boolean().optional(),
  operating_countries: z.number().optional(),
  multilingual_ui: z.boolean().optional(),
});

const UploadDocumentSchema = z.object({
  vendor_id: z.string().describe("Vendor UUID"),
  doc_type: z
    .enum([
      "security_whitepaper",
      "architecture_doc",
      "legal_doc",
      "financial_doc",
      "other",
    ])
    .describe("Document category"),
  filename: z.string().describe("Original filename"),
  content_base64: z.string().describe("Base64-encoded file content"),
});

const VendorIdSchema = z.object({
  vendor_id: z.string().describe("Vendor UUID"),
});

const GetReportSchema = z.object({
  vendor_id: z.string().describe("Vendor UUID"),
  format: z
    .enum(["json", "summary"])
    .default("summary")
    .describe("json = full report JSON, summary = human-readable text"),
});

const ListVendorsSchema = z.object({
  search: z.string().optional().describe("Name/description search"),
  status: z.enum(["submitted", "in_review", "cleared", "rejected"]).optional(),
  risk_flag: z.enum(["green", "amber", "red"]).optional(),
  page: z.number().default(1),
  size: z.number().default(20),
});

const GetTasksSchema = z.object({
  vendor_id: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(["open", "in_progress", "done"]).optional(),
});

const UpdateTaskSchema = z.object({
  task_id: z.string().describe("Task UUID"),
  status: z.enum(["open", "in_progress", "done"]).optional(),
  assigned_to: z.string().optional().describe("User UUID to assign"),
  priority: z.enum(["high", "medium", "low"]).optional(),
});

const ApproveVendorSchema = z.object({
  vendor_id: z.string().describe("Vendor UUID"),
  decision: z.enum(["cleared", "rejected"]).describe("Approval decision"),
  reason: z.string().optional().describe("Reason for decision"),
});

const GetAnalyticsSchema = z.object({
  from_date: z.string().optional().describe("ISO date filter start"),
  to_date: z.string().optional().describe("ISO date filter end"),
});

// ─── Server setup ─────────────────────────────────────────────────────────────

const server = new Server(
  { name: "vendor-assessment-mcp", version: "1.0.0" },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  },
);

// ─── Tools list ───────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "submit_vendor",
      description:
        "Create a new vendor record with full intake form data. Returns the created vendor with its ID for subsequent operations.",
      inputSchema: {
        type: "object",
        properties: SubmitVendorSchema.shape,
        required: ["company_name"],
      },
    },
    {
      name: "upload_document",
      description:
        "Attach a document to a vendor for LLM analysis during assessment. Supported doc_types: security_whitepaper, architecture_doc, legal_doc, financial_doc, other.",
      inputSchema: {
        type: "object",
        properties: {
          vendor_id: { type: "string" },
          doc_type: {
            type: "string",
            enum: [
              "security_whitepaper",
              "architecture_doc",
              "legal_doc",
              "financial_doc",
              "other",
            ],
          },
          filename: { type: "string" },
          content_base64: { type: "string" },
        },
        required: ["vendor_id", "doc_type", "filename", "content_base64"],
      },
    },
    {
      name: "run_assessment",
      description:
        "Trigger the 8-dimension scoring engine for a vendor. Returns immediately with status 'pending' — poll get_assessment_status until 'complete'.",
      inputSchema: {
        type: "object",
        properties: { vendor_id: { type: "string" } },
        required: ["vendor_id"],
      },
    },
    {
      name: "get_assessment_status",
      description:
        "Poll the latest assessment status for a vendor. Status: pending → running → complete | failed.",
      inputSchema: {
        type: "object",
        properties: { vendor_id: { type: "string" } },
        required: ["vendor_id"],
      },
    },
    {
      name: "get_report",
      description:
        "Retrieve the full structured vendor risk report with 8 dimension scores, evidence, and action items. Use format='summary' for a concise AI-readable version.",
      inputSchema: {
        type: "object",
        properties: {
          vendor_id: { type: "string" },
          format: {
            type: "string",
            enum: ["json", "summary"],
            default: "summary",
          },
        },
        required: ["vendor_id"],
      },
    },
    {
      name: "list_vendors",
      description:
        "Query the vendor pipeline with optional filters by status, risk flag, or search term.",
      inputSchema: {
        type: "object",
        properties: {
          search: { type: "string" },
          status: {
            type: "string",
            enum: ["submitted", "in_review", "cleared", "rejected"],
          },
          risk_flag: { type: "string", enum: ["green", "amber", "red"] },
          page: { type: "number", default: 1 },
          size: { type: "number", default: 20 },
        },
      },
    },
    {
      name: "get_tasks",
      description:
        "Get action items generated from assessments, filterable by vendor, department, or status.",
      inputSchema: {
        type: "object",
        properties: {
          vendor_id: { type: "string" },
          department: { type: "string" },
          status: { type: "string", enum: ["open", "in_progress", "done"] },
        },
      },
    },
    {
      name: "update_task",
      description: "Update a task status, assignee, or priority.",
      inputSchema: {
        type: "object",
        properties: {
          task_id: { type: "string" },
          status: { type: "string", enum: ["open", "in_progress", "done"] },
          assigned_to: { type: "string" },
          priority: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: ["task_id"],
      },
    },
    {
      name: "approve_vendor",
      description:
        "Set the final decision on a vendor: 'cleared' (onboarding approved) or 'rejected'.",
      inputSchema: {
        type: "object",
        properties: {
          vendor_id: { type: "string" },
          decision: { type: "string", enum: ["cleared", "rejected"] },
          reason: { type: "string" },
        },
        required: ["vendor_id", "decision"],
      },
    },
    {
      name: "get_analytics",
      description:
        "Get pipeline analytics: total vendors, risk distribution, avg score, avg time-to-onboard for the dashboard.",
      inputSchema: {
        type: "object",
        properties: {
          from_date: { type: "string" },
          to_date: { type: "string" },
        },
      },
    },
  ],
}));

// ─── Tool handlers ────────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // ── submit_vendor ─────────────────────────────────────────────────────
      case "submit_vendor": {
        const input = SubmitVendorSchema.parse(args);
        const { data, error } = await apiCall("post", "/api/vendors", input);
        if (error) return toolError(`Failed to create vendor: ${error}`);
        const v = data as Record<string, unknown>;
        return toolSuccess(
          `✅ Vendor created successfully!\n- ID: ${v.id}\n- Name: ${v.company_name}\n- Status: ${v.status}\n\nNext: call run_assessment with vendor_id="${v.id}"`,
        );
      }

      // ── upload_document ───────────────────────────────────────────────────
      case "upload_document": {
        const input = UploadDocumentSchema.parse(args);
        // Post as JSON (backend handles base64 decode or uses the filename stub)
        const { data, error } = await apiCall(
          "post",
          `/api/vendors/${input.vendor_id}/upload-base64`,
          {
            doc_type: input.doc_type,
            filename: input.filename,
            content_base64: input.content_base64,
          },
        );
        if (error) return toolError(`Failed to upload document: ${error}`);
        const d = data as Record<string, unknown>;
        return toolSuccess(
          `✅ Document uploaded\n- ID: ${d.id}\n- Type: ${d.doc_type}\n- File: ${d.filename}`,
        );
      }

      // ── run_assessment ────────────────────────────────────────────────────
      case "run_assessment": {
        const { vendor_id } = VendorIdSchema.parse(args);
        const { data, error } = await apiCall(
          "post",
          `/api/assessments/${vendor_id}/run`,
          {},
        );
        if (error) return toolError(`Failed to start assessment: ${error}`);
        const a = data as Record<string, unknown>;
        return toolSuccess(
          `🚀 Assessment started\n- Assessment ID: ${a.id}\n- Status: ${a.status}\n\nPoll get_assessment_status with vendor_id="${vendor_id}" until status = "complete".`,
        );
      }

      // ── get_assessment_status ─────────────────────────────────────────────
      case "get_assessment_status": {
        const { vendor_id } = VendorIdSchema.parse(args);
        const { data, error } = await apiCall(
          "get",
          `/api/assessments/${vendor_id}/status`,
        );
        if (error) return toolError(`Failed to get status: ${error}`);
        const a = data as Record<string, unknown>;
        const statusEmoji: Record<string, string> = {
          pending: "⏳",
          running: "⚙️",
          complete: "✅",
          failed: "❌",
        };
        const flagEmoji: Record<string, string> = {
          green: "🟢",
          amber: "🟡",
          red: "🔴",
        };
        const statusStr = String(a.status);
        const flag = String(a.risk_flag ?? "");
        return toolSuccess(
          `${statusEmoji[statusStr] ?? "?"} Assessment Status: ${statusStr.toUpperCase()}\n` +
            `- Assessment ID: ${a.id}\n` +
            `- Risk: ${flagEmoji[flag] ?? ""} ${flag || "—"}\n` +
            `- Score: ${a.composite_score ?? "—"}/100\n` +
            (a.error_message ? `- Error: ${a.error_message}\n` : "") +
            (statusStr === "complete"
              ? `\nNext: call get_report with vendor_id="${vendor_id}"`
              : ""),
        );
      }

      // ── get_report ────────────────────────────────────────────────────────
      case "get_report": {
        const { vendor_id, format } = GetReportSchema.parse(args);
        const { data, error } = await apiCall(
          "get",
          `/api/reports/${vendor_id}`,
        );
        if (error) return toolError(`Failed to get report: ${error}`);
        const r = data as Record<string, unknown>;
        if (format === "json") {
          return toolSuccess(JSON.stringify(r.report_json, null, 2));
        }
        // Human-readable summary
        const rj = r.report_json as Record<string, unknown> | null;
        if (!rj) return toolSuccess(JSON.stringify(r, null, 2));
        const flagEmoji: Record<string, string> = {
          green: "🟢",
          amber: "🟡",
          red: "🔴",
        };
        const flag = String(rj.overall_risk_flag ?? "");
        let summary = `# Vendor Risk Report: ${rj.vendor_name}\n\n`;
        summary += `**Overall Score:** ${rj.composite_score}/100  ${flagEmoji[flag] ?? ""} ${flag.toUpperCase()}\n\n`;
        summary += `**Summary:** ${rj.executive_summary}\n\n## Dimension Scores\n\n`;
        const dims = (rj.dimensions as Array<Record<string, unknown>>) ?? [];
        for (const d of dims) {
          const df = String(d.risk_flag ?? "");
          summary += `- ${flagEmoji[df] ?? ""} **${d.label}**: ${d.composite_score}/100 (${df})\n`;
        }
        const tasks = (rj.action_items as Array<Record<string, unknown>>) ?? [];
        if (tasks.length > 0) {
          summary += `\n## Action Items (${tasks.length})\n`;
          for (const t of tasks.slice(0, 5)) {
            summary += `- [${t.priority?.toString().toUpperCase()}] ${t.title} (${t.department})\n`;
          }
          if (tasks.length > 5) summary += `...and ${tasks.length - 5} more\n`;
        }
        return toolSuccess(summary);
      }

      // ── list_vendors ──────────────────────────────────────────────────────
      case "list_vendors": {
        const input = ListVendorsSchema.parse(args ?? {});
        const params: Record<string, unknown> = {};
        if (input.search) params.search = input.search;
        if (input.status) params.status_filter = input.status;
        if (input.risk_flag) params.risk_flag = input.risk_flag;
        params.page = input.page;
        params.size = input.size;
        const { data, error } = await apiCall(
          "get",
          "/api/vendors",
          undefined,
          params,
        );
        if (error) return toolError(`Failed to list vendors: ${error}`);
        const vendors = data as Array<Record<string, unknown>>;
        if (!vendors.length)
          return toolSuccess("No vendors found matching the criteria.");
        const flagEmoji: Record<string, string> = {
          green: "🟢",
          amber: "🟡",
          red: "🔴",
        };
        let result = `Found ${vendors.length} vendor(s):\n\n`;
        for (const v of vendors) {
          const rf = String(v.risk_flag ?? "");
          result += `- **${v.company_name}** (${v.country ?? "?"})\n  ID: ${v.id}  Status: ${v.status}  ${flagEmoji[rf] ?? ""} ${rf || "—"}  Score: ${v.composite_score ?? "—"}/100\n`;
        }
        return toolSuccess(result);
      }

      // ── get_tasks ─────────────────────────────────────────────────────────
      case "get_tasks": {
        const input = GetTasksSchema.parse(args ?? {});
        const params: Record<string, unknown> = {};
        if (input.vendor_id) params.vendor_id = input.vendor_id;
        if (input.department) params.department = input.department;
        if (input.status) params.status_filter = input.status;
        const { data, error } = await apiCall(
          "get",
          "/api/tasks",
          undefined,
          params,
        );
        if (error) return toolError(`Failed to get tasks: ${error}`);
        const tasks = data as Array<Record<string, unknown>>;
        if (!tasks.length) return toolSuccess("No tasks found.");
        let result = `${tasks.length} task(s):\n\n`;
        for (const t of tasks) {
          const priorityEmoji: Record<string, string> = {
            high: "🔴",
            medium: "🟡",
            low: "🟢",
          };
          const p = String(t.priority ?? "");
          result += `${priorityEmoji[p] ?? "⚪"} [${t.status}] ${t.title}\n  ID: ${t.id}  Dept: ${t.department}\n`;
        }
        return toolSuccess(result);
      }

      // ── update_task ───────────────────────────────────────────────────────
      case "update_task": {
        const { task_id, ...update } = UpdateTaskSchema.parse(args);
        const { data, error } = await apiCall(
          "patch",
          `/api/tasks/${task_id}`,
          update,
        );
        if (error) return toolError(`Failed to update task: ${error}`);
        const t = data as Record<string, unknown>;
        return toolSuccess(
          `✅ Task updated\n- Title: ${t.title}\n- Status: ${t.status}\n- Priority: ${t.priority}`,
        );
      }

      // ── approve_vendor ────────────────────────────────────────────────────
      case "approve_vendor": {
        const { vendor_id, decision, reason } = ApproveVendorSchema.parse(args);
        const { data, error } = await apiCall(
          "post",
          `/api/vendors/${vendor_id}/approve`,
          { decision, reason },
        );
        if (error) return toolError(`Failed to approve vendor: ${error}`);
        const v = data as Record<string, unknown>;
        const emoji = decision === "cleared" ? "✅" : "❌";
        return toolSuccess(
          `${emoji} Vendor ${decision.toUpperCase()}\n- Company: ${v.company_name}\n- Status: ${v.status}${reason ? `\n- Reason: ${reason}` : ""}`,
        );
      }

      // ── get_analytics ─────────────────────────────────────────────────────
      case "get_analytics": {
        const { data, error } = await apiCall("get", "/api/analytics/summary");
        if (error) return toolError(`Failed to get analytics: ${error}`);
        const s = data as Record<string, unknown>;
        return toolSuccess(
          `📊 Pipeline Analytics\n\n` +
            `- Total Vendors: ${s.total_vendors}\n` +
            `- Assessments Completed: ${s.total_assessments}\n` +
            `- ✅ Cleared: ${s.cleared_vendors}  ❌ Rejected: ${s.rejected_vendors}  🔄 In Review: ${s.in_review_vendors}\n\n` +
            `Risk Distribution:\n` +
            `  🟢 Green: ${s.green_count}  🟡 Amber: ${s.amber_count}  🔴 Red: ${s.red_count}\n\n` +
            `- Avg Composite Score: ${s.avg_composite_score ? Number(s.avg_composite_score).toFixed(1) : "—"}/100\n` +
            `- Avg Time to Assess: ${s.avg_time_to_assess_minutes ? Number(s.avg_time_to_assess_minutes).toFixed(1) + " min" : "—"}`,
        );
      }

      default:
        return toolError(`Unknown tool: ${name}`);
    }
  } catch (err: unknown) {
    return toolError(`Tool execution error: ${String(err)}`);
  }
});

// ─── Resources ────────────────────────────────────────────────────────────────

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "vendor://list",
      name: "Vendor Pipeline",
      description:
        "Live snapshot of all vendors in the pipeline with status and risk flags",
      mimeType: "application/json",
    },
    {
      uri: "vendor://{id}/report",
      name: "Vendor Report",
      description:
        "Full assessment report for a specific vendor. Replace {id} with the vendor UUID.",
      mimeType: "application/json",
    },
    {
      uri: "tasks://{department}",
      name: "Department Tasks",
      description:
        "Open action items for a department. Replace {department} with: procurement | it_security | legal | ai_innovation",
      mimeType: "application/json",
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  // vendor://list
  if (uri === "vendor://list") {
    const { data, error } = await apiCall("get", "/api/vendors", undefined, {
      size: 50,
    });
    if (error) throw new Error(error);
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  // vendor://{id}/report
  const reportMatch = uri.match(/^vendor:\/\/([^/]+)\/report$/);
  if (reportMatch) {
    const vendorId = reportMatch[1];
    const { data, error } = await apiCall("get", `/api/reports/${vendorId}`);
    if (error) throw new Error(error);
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  // tasks://{department}
  const tasksMatch = uri.match(/^tasks:\/\/(.+)$/);
  if (tasksMatch) {
    const department = tasksMatch[1];
    const { data, error } = await apiCall("get", "/api/tasks", undefined, {
      department,
      status_filter: "open",
    });
    if (error) throw new Error(error);
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource URI: ${uri}`);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toolSuccess(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function toolError(text: string) {
  return {
    content: [{ type: "text" as const, text: `❌ ${text}` }],
    isError: true,
  };
}

// ─── Start ────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("Vendor Assessment MCP Server running on stdio\n");
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err}\n`);
  process.exit(1);
});
