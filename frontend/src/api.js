const API_BASE = import.meta.env.VITE_API_BASE || ""; // "" en prod SWA

function getToken() { 
  return localStorage.getItem("bm_token") || ""; 
}

async function jsonFetch(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const res = await fetch(API_BASE + url, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  signup: (payload) => jsonFetch("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login:  (payload) => jsonFetch("/api/auth/login",  { method: "POST", body: JSON.stringify(payload) }),
  me:     () => jsonFetch("/api/auth/me"),
  vote:   (payload) => jsonFetch("/api/vote",  { method: "POST", body: JSON.stringify(payload) }),
  getVotes: () => jsonFetch("/api/votes")
};
