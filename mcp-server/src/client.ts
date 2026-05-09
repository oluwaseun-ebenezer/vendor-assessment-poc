import axios, { AxiosInstance } from "axios";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const MCP_SERVICE_TOKEN = process.env.MCP_SERVICE_TOKEN || "";

export const api: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    Authorization: `Bearer ${MCP_SERVICE_TOKEN}`,
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

/** Safely call the backend and return { data } or { error } */
export async function apiCall<T = unknown>(
  method: "get" | "post" | "patch" | "delete",
  path: string,
  body?: unknown,
  params?: Record<string, unknown>,
): Promise<{ data?: T; error?: string }> {
  try {
    const res = await api.request<T>({ method, url: path, data: body, params });
    return { data: res.data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const detail = err.response?.data?.detail ?? err.message;
      return { error: String(detail) };
    }
    return { error: String(err) };
  }
}
