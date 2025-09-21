import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth"; // <- notre contexte d'auth (token/JWT)

const QUESTION = "Est-ce que François Bayrou nous manque ?";

export default function Home() {
  const { isSignedIn, user } = useAuth(); // <- plus de Clerk
  const [choice, setChoice] = useState("oui");
  const [votes, setVotes] = useState([]);
  const [stats, setStats] = useState({ total: 0, oui: 0, non: 0, pctOui: 0, pctNon: 0 });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const { votes, stats } = await api.getVotes();
        if (!stop) {
          setVotes(votes || []);
          setStats(stats || { total: 0, oui: 0, non: 0, pctOui: 0, pctNon: 0 });
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
    const t = setInterval(load, 5000);
    return () => { stop = true; clearInterval(t); };
  }, []);

  const handleVote = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      await api.vote({ userId: user.id, choice });
      setMsg("Vote enregistré ✅");
      const { votes, stats } = await api.getVotes();
      setVotes(votes || []); setStats(stats || { total: 0, oui: 0, non: 0, pctOui: 0, pctNon: 0 });
    } catch (e) {
      setMsg(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const sortedVotes = useMemo(
    () => [...votes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [votes]
  );

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{QUESTION}</h1>
        </div>

        {/* Choix & bouton voter */}
        <form onSubmit={handleVote} className="flex items-center justify-center gap-6 mb-6">
          <button
            type="button"
            onClick={() => setChoice("oui")}
            className={`px-5 py-3 rounded-2xl border ${choice === "oui" ? "bg-green-600 text-white" : "bg-white"}`}
          >
            Oui
          </button>
          <button
            type="button"
            onClick={() => setChoice("non")}
            className={`px-5 py-3 rounded-2xl border ${choice === "non" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            Non
          </button>
          <button
            className="px-5 py-3 rounded-2xl bg-black text-white disabled:opacity-50"
            disabled={loading}
          >
            Voter
          </button>
        </form>

        {/* Stats + barre */}
        <div className="mb-2 flex justify-between text-sm">
          <span>Oui: {stats.pctOui}%</span>
          <span>Non: {stats.pctNon}%</span>
        </div>
        <div className="w-full h-5 rounded-full overflow-hidden border">
          <div className="h-full bg-green-600 inline-block" style={{ width: `${stats.pctOui || 0}%` }} />
          <div className="h-full bg-red-600 inline-block" style={{ width: `${stats.pctNon || 0}%` }} />
        </div>

        {msg && <div className="mt-4 p-3 rounded bg-yellow-50">{msg}</div>}

        {/* Liste des votes */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Derniers votes</h2>
          <ul className="space-y-2 max-h-64 overflow-auto">
            {sortedVotes.length === 0 && (
              <li className="opacity-60">Aucun vote pour l’instant.</li>
            )}
            {sortedVotes.map(v => {
              const date = v.createdAt ? new Date(v.createdAt).toLocaleString() : "";
              // On essaie d'afficher le pseudo si l'API l'envoie (v.userPseudo), sinon un fallback court de l'id
              const displayName = v.userPseudo || (v.userPseudo ? `user ${v.userPseudo.slice(0, 8)}…` : "user");
              const voteLabel = (v.choice || "").toUpperCase();
              return (
                <li key={v.id} className="border rounded p-2 flex items-center justify-between">
                  <span className="opacity-70 text-sm">{date}</span>
                  <span className="font-medium">{displayName}</span>
                  <span className={`text-sm font-semibold ${v.choice === "oui" ? "text-green-700" : "text-red-700"}`}>
                    {voteLabel}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
