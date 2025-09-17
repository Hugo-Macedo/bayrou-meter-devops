import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

export default function App() {
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [choice, setChoice] = useState("oui");
  const [votes, setVotes] = useState([]);
  const [stats, setStats] = useState({ total: 0, oui: 0, non: 0, pctOui: 0, pctNon: 0 });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // charge résultats (polling simple toutes les 5s)
  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const { votes, stats } = await api.getVotes();
        if (!stop) {
          setVotes(votes);
          setStats(stats);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
    const t = setInterval(load, 5000);
    return () => { stop = true; clearInterval(t); };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      const u = await api.createUser({ pseudo, email });
      setUser(u);
      setMsg("Utilisateur créé ✅");
    } catch (e) {
      setMsg(e.message.includes("déjà utilisé") ? "Email déjà utilisé ❌" : `Erreur: ${e.message}`);
    } finally { setLoading(false); }
  };

  const handleVote = async (e) => {
    e.preventDefault();
    if (!user) { setMsg("Identifie-toi d’abord."); return; }
    setLoading(true); setMsg("");
    try {
      await api.vote({ userId: user.id, choice });
      setMsg("Vote enregistré ✅");
      // refresh instantané
      const { votes, stats } = await api.getVotes();
      setVotes(votes); setStats(stats);
    } catch (e) {
      setMsg(`Erreur: ${e.message}`);
    } finally { setLoading(false); }
  };

  const sortedVotes = useMemo(
    () => [...votes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [votes]
  );

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-4">Bayrou-Meter</h1>
      <p className="mb-6 italic">Question : “Est-ce que François Bayrou nous manque ?”</p>

      {/* Identification */}
      <section className="mb-6 p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-3">1) Identifie-toi</h2>
        {user ? (
          <div className="p-3 bg-green-50 rounded">Connecté en tant que <b>{user.pseudo}</b> ({user.email})</div>
        ) : (
          <form onSubmit={handleRegister} className="grid gap-3">
            <input
              className="border rounded p-2"
              placeholder="Pseudo"
              value={pseudo} onChange={e => setPseudo(e.target.value)}
              required minLength={2}
            />
            <input
              className="border rounded p-2"
              type="email" placeholder="Email"
              value={email} onChange={e => setEmail(e.target.value)}
              required
            />
            <button className="rounded px-4 py-2 bg-black text-white disabled:opacity-50" disabled={loading}>
              Créer mon compte
            </button>
          </form>
        )}
      </section>

      {/* Vote */}
      <section className="mb-6 p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-3">2) Vote</h2>
        <form onSubmit={handleVote} className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="vote" value="oui" checked={choice === "oui"} onChange={() => setChoice("oui")} />
            Oui
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="vote" value="non" checked={choice === "non"} onChange={() => setChoice("non")} />
            Non
          </label>
          <button className="rounded px-4 py-2 bg-black text-white disabled:opacity-50" disabled={loading || !user}>
            Envoyer mon vote
          </button>
        </form>
      </section>

      {/* Résultats */}
      <section className="mb-6 p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-3">3) Résultats</h2>
        <div className="flex items-center gap-6 mb-4">
          <div>Total : <b>{stats.total}</b></div>
          <div>Oui : <b>{stats.oui}</b> ({stats.pctOui}%)</div>
          <div>Non : <b>{stats.non}</b> ({stats.pctNon}%)</div>
        </div>
        <ul className="space-y-2 max-h-64 overflow-auto">
          {sortedVotes.map(v => (
            <li key={v.id} className="border rounded p-2 flex justify-between">
              <span className="opacity-70 text-sm">{new Date(v.createdAt).toLocaleString()}</span>
              <span className="font-semibold">{v.choice.toUpperCase()}</span>
              <span className="opacity-70 text-sm">user: {v.userId.slice(0,8)}…</span>
            </li>
          ))}
          {sortedVotes.length === 0 && <li className="opacity-60">Aucun vote pour l’instant.</li>}
        </ul>
      </section>

      {msg && <div className="mt-4 p-3 rounded bg-yellow-50">{msg}</div>}
    </div>
  );
}