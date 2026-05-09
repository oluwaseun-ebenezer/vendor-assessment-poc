"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
exports.apiCall = apiCall;
const axios_1 = __importDefault(require("axios"));
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const MCP_SERVICE_TOKEN = process.env.MCP_SERVICE_TOKEN || "";
exports.api = axios_1.default.create({
    baseURL: BACKEND_URL,
    headers: {
        Authorization: `Bearer ${MCP_SERVICE_TOKEN}`,
        "Content-Type": "application/json",
    },
    timeout: 60000,
});
/** Safely call the backend and return { data } or { error } */
async function apiCall(method, path, body, params) {
    try {
        const res = await exports.api.request({ method, url: path, data: body, params });
        return { data: res.data };
    }
    catch (err) {
        if (axios_1.default.isAxiosError(err)) {
            const detail = err.response?.data?.detail ?? err.message;
            return { error: String(detail) };
        }
        return { error: String(err) };
    }
}
