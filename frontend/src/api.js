const API_BASE = import.meta.env.VITE_API_BASE || ""; // vide = même domaine (SWA)
async function jsonFetch(url, options = {}) {
  const res = await fetch(API_BASE + url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}

export const api = {
  createUser: (payload) =>
    jsonFetch("/api/user", { method: "POST", body: JSON.stringify(payload) }),
  vote: (payload) =>
    jsonFetch("/api/vote", { method: "POST", body: JSON.stringify(payload) }),
  getVotes: () => jsonFetch("/api/votes"),
};
