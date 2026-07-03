// frontend/src/api/apiClient.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ResponseData<T = any> {
  data: T;
  status: number;
  statusText: string;
}

function hasUserToken(): boolean {
  return localStorage.getItem('auth_state') !== null;
}

function hasAdminToken(): boolean {
  return localStorage.getItem('admin_auth_state') !== null;
}

export function markUserAuthenticated() {
  localStorage.setItem('auth_state', 'active');
}

export function markAdminAuthenticated() {
  localStorage.setItem('admin_auth_state', 'active');
}

export function clearAuthState() {
  localStorage.removeItem('auth_state');
  localStorage.removeItem('admin_auth_state');
}

// 10-second ceiling so a dead backend never freezes the admin UI
const REQUEST_TIMEOUT_MS = 10_000;

async function request<T = any>(
  method: string,
  url: string,
  body?: any,
): Promise<ResponseData<T>> {
  // Gate /auth/me calls to prevent 401 errors
  const isAuthMe = url.endsWith('/auth/me') || url.endsWith('/me');
  if (isAuthMe) {
    const isAdminRoute = url.startsWith('/admin');
    if (isAdminRoute) {
      if (!hasAdminToken()) {
        const err: any = new Error('Unauthorized');
        err.response = { data: { message: 'Unauthorized' }, status: 401 };
        throw err;
      }
    } else {
      if (!hasUserToken()) {
        const err: any = new Error('Unauthorized');
        err.response = { data: { message: 'Unauthorized' }, status: 401 };
        throw err;
      }
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (url.startsWith('/admin')) {
    const adminOriginToken = import.meta.env.VITE_ADMIN_ORIGIN_TOKEN;
    if (adminOriginToken) {
      headers['X-Admin-Origin'] = adminOriginToken;
    }
  }

  const fetchUrl = url.startsWith('http') ? url : `${API_BASE}/api/v1${url}`;

  // AbortController-based timeout — kills the fetch after 10 s so the UI
  // never hangs on a dead / slow backend (e.g. MongoDB query that never resolves).
  const ac = new AbortController();
  const killTimer = setTimeout(() => ac.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(fetchUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal: ac.signal,
    });

    clearTimeout(killTimer);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err: any = new Error(data.message || 'Request failed');
      err.response = { data, status: response.status };
      throw err;
    }

    return { data, status: response.status, statusText: response.statusText };
  } catch (err: any) {
    clearTimeout(killTimer);

    // AbortError means the timeout fired — surface as 408 so the UI can show
    // a real message instead of spinning forever.
    if (err.name === 'AbortError') {
      const timeoutErr: any = new Error('انتهت مهلة الاتصال بالخادم — تحقق من أن الباك إند يعمل');
      timeoutErr.response = {
        data: { message: 'انتهت مهلة الاتصال بالخادم — تحقق من أن الباك إند يعمل' },
        status: 408,
      };
      throw timeoutErr;
    }

    throw err;
  }
}

export default {
  get: <T = any>(url: string) => request<T>('GET', url),
  post: <T = any>(url: string, body?: any) => request<T>('POST', url, body),
  put: <T = any>(url: string, body?: any) => request<T>('PUT', url, body),
  patch: <T = any>(url: string, body?: any) => request<T>('PATCH', url, body),
  delete: <T = any>(url: string) => request<T>('DELETE', url),
};
