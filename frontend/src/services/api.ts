const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

async function fetchAPI(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  return res;
}

// ── Auth ─────────────────────────────────────────
export async function apiRegister(email: string, password: string, name: string) {
  const res = await fetchAPI('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function apiLogin(email: string, password: string) {
  const res = await fetchAPI('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function apiGetMe(token: string) {
  const res = await fetchAPI('/api/auth/me', {}, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get user');
  return data;
}

// ── Chat ─────────────────────────────────────────
export async function apiGetSessions(token: string) {
  const res = await fetchAPI('/api/chat/sessions', {}, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get sessions');
  return data;
}

export async function apiGetHistory(sessionId: string, token: string) {
  const res = await fetchAPI(`/api/chat/history/${sessionId}`, {}, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get history');
  return data;
}

export async function apiDeleteSession(sessionId: string, token: string) {
  const res = await fetchAPI(`/api/chat/session/${sessionId}`, { method: 'DELETE' }, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete session');
  return data;
}

// ── User / Preferences ────────────────────────────
export async function apiGetProfile(token: string) {
  const res = await fetchAPI('/api/user/profile', {}, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get profile');
  return data;
}

export async function apiUpdatePreferences(prefs: Record<string, unknown>, token: string) {
  const res = await fetchAPI('/api/user/preferences', {
    method: 'PATCH',
    body: JSON.stringify(prefs),
  }, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update preferences');
  return data;
}

export async function apiUpdateMemory(memory: string, token: string) {
  const res = await fetchAPI('/api/user/memory', {
    method: 'PATCH',
    body: JSON.stringify({ memory }),
  }, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update memory');
  return data;
}

export async function apiClearMemory(token: string) {
  const res = await fetchAPI('/api/user/memory', { method: 'DELETE' }, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to clear memory');
  return data;
}

// ── Streaming Chat ────────────────────────────────
export function streamChatMessage(
  message: string,
  history: Array<{ role: string; content: string }>,
  sessionId: string | null,
  token: string | null,
  onChunk: (delta: string, accumulated: string) => void,
  onComplete: (full: string, sessionId: string) => void,
  onError: (err: string) => void
): () => void {
  const ctrl = new AbortController();

  fetch(`${BACKEND_URL}/api/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history, sessionId }),
    signal: ctrl.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        onError(err.error || 'Request failed');
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) { onError('No stream'); return; }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          try {
            const json = JSON.parse(trimmed.slice(6));
            if (json.error) { onError(json.error); return; }
            if (json.done) {
              onComplete(json.accumulated, json.sessionId || sessionId || '');
            } else {
              onChunk(json.delta, json.accumulated);
            }
          } catch { /* skip */ }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') onError(err.message);
    });

  return () => ctrl.abort();
}

export { BACKEND_URL };
