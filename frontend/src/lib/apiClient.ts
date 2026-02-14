import { showErrorToast } from './toast';

const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const useProxy = process.env.NEXT_PUBLIC_API_PROXY !== "false";

function normalizeBase(base: string) {
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Prefer same-origin requests so Next.js rewrites can proxy to the backend.
  // This makes auth cookies available on the Vercel domain (middleware + client).
  if (useProxy && normalizedPath.startsWith("/api")) return normalizedPath;
  if (useProxy && normalizedPath === "/health") return normalizedPath;

  const base = rawBase ? normalizeBase(rawBase) : "";
  if (!base) return normalizedPath;
  return `${base}${normalizedPath}`;
}

export function apiFetch(input: string, init: RequestInit = {}) {
  const url = apiUrl(input);
  const credentials = init.credentials ?? "include";
  const headers = new Headers(init.headers);
  if (!headers.has("accept")) headers.set("accept", "application/json");
  return fetch(url, { ...init, credentials, headers });
}

export async function readApiBody(res: Response): Promise<{ json?: unknown; text?: string }> {
  const contentType = res.headers.get("content-type");
  const text = await res.text();
  
  if (!text) return {};

  // Try to parse as JSON if content-type indicates JSON or if it looks like JSON
  if (contentType?.includes("application/json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      return { json: parsed };
    } catch (error) {
      console.warn("Failed to parse JSON response:", error, "Response text:", text);
      return { text };
    }
  }

  return { text };
}

// Enhanced API fetch with automatic error handling and toast notifications
interface ApiFetchWithToastOptions extends RequestInit {
  skipErrorToast?: boolean; // Set to true to skip automatic error toast
  customErrorMessage?: string; // Override default error message
}

export async function apiFetchWithToast(
  input: string,
  options: ApiFetchWithToastOptions = {}
): Promise<Response> {
  const { skipErrorToast, customErrorMessage, ...init } = options;

  try {
    const response = await apiFetch(input, init);

    // If response is not OK and we should show toast, handle error
    if (!response.ok && !skipErrorToast) {
      const body = await readApiBody(response.clone());
      const data = body.json as any;
      
      const errorMessage = customErrorMessage || 
        data?.error || 
        data?.message || 
        body.text || 
        `Request failed with status ${response.status}`;

      showErrorToast(errorMessage);
    }

    return response;
  } catch (error) {
    // Handle network errors
    if (!skipErrorToast) {
      const errorMessage = customErrorMessage || "Server not responding. Please check your connection.";
      showErrorToast(errorMessage);
    }
    throw error;
  }
}

