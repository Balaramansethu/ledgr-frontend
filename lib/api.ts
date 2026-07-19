export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type Json = Record<string, unknown> | unknown[];

interface RequestOptions {
  method?: string;
  body?: Json;
  /** Send FormData instead of JSON (file uploads). */
  form?: FormData;
  signal?: AbortSignal;
}

/**
 * Thin fetch wrapper. Calls are same-origin `/api/*` (proxied to the Express
 * server), so the httpOnly session cookie rides along automatically. Every
 * request carries the client timezone offset so server-side date math matches
 * the user's local calendar.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'x-tz-offset': String(new Date().getTimezoneOffset()),
  };
  let body: BodyInit | undefined;

  if (options.form) {
    body = options.form;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const res = await fetch(`/api${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers,
    body,
    signal: options.signal,
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const message = (data && (data.error as string)) || res.statusText || 'Request failed';
    throw new ApiError(res.status, message, data?.details);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => apiFetch<T>(path, { signal }),
  post: <T>(path: string, body?: Json) => apiFetch<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: Json) => apiFetch<T>(path, { method: 'PATCH', body }),
  put: <T>(path: string, body?: Json) => apiFetch<T>(path, { method: 'PUT', body }),
  del: <T>(path: string, body?: Json) => apiFetch<T>(path, { method: 'DELETE', body }),
  upload: <T>(path: string, form: FormData) => apiFetch<T>(path, { method: 'POST', form }),
};
