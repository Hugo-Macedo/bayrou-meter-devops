import { useEffect, useMemo, useState } from "react";
import { useUser, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { api } from "../api";

const QUESTION = "Est-ce que François Bayrou nous manque ?";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [backendUser, setBackendUser] = useState(null);
  const [choice, setChoice] = useState("oui");
  const [votes, setVotes] = useState([]);
  const [stats, setStats] = useState({ total: 0, oui: 0, non: 0, pctOui: 0, pctNon: 0 });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // ⚠️ On supprime le "if (!isSignedIn) return ..."

  // Crée l'utilisateur côté API si besoin
  useEffect(() => {
    if (!isSignedIn || !user) return; // check ici plutôt que return en haut
    let stop = false;

    const ensureUser = async () => {
      try {
        const pseudo =
          user.username ||
          user.firstName ||
          (user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress.split("@")[0] : "user");
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) return;

        const created = await api.createUser({ pseudo, email });
        if (!stop) {
          setBackendUser(created);
          localStorage.setItem("bm_user_id", created.id);
        }
      } catch (e) {
        if (e.message?.includes("déjà utilisé")) {
          const email = user.primaryEmailAddress?.emailAddress;
          const storedId = localStorage.getItem("bm_user_id");
          setBackendUser({ id: storedId, email });
        } else {
          console.error(e);
        }
      }
    };

    ensureUser();
    return () => { stop = true; };
  }, [isSignedIn, user]);

  // Charge les résultats
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

  // Vote
  const handleVote = async (e) => {
    e.preventDefault();
    if (!user) { setMsg("Identifie-toi d’abord."); return; }
    setLoading(true); setMsg("");

    const userId = backendUser?.id || localStorage.getItem("bm_user_id");
    if (!userId) {
      setMsg("Utilisateur API non trouvé. Réessaie dans un instant.");
      setLoading(false);
      return;
    }

    try {
      await api.vote({ userId, choice });
      setMsg("Vote enregistré ✅");
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
    <>
      <SignedOut><Navigate to="/login" replace /></SignedOut>
      <SignedIn>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">{QUESTION}</h1>
            </div>

            <form onSubmit={handleVote} className="flex items-center justify-center gap-6 mb-6">
              <button type="button" onClick={() => setChoice("oui")}
                className={`px-5 py-3 rounded-2xl border ${choice === "oui" ? "bg-green-600 text-white" : "bg-white"}`}>
                Oui
              </button>
              <button type="button" onClick={() => setChoice("non")}
                className={`px-5 py-3 rounded-2xl border ${choice === "non" ? "bg-red-600 text-white" : "bg-white"}`}>
                Non
              </button>
              <button className="px-5 py-3 rounded-2xl bg-black text-white disabled:opacity-50"
                disabled={loading || !backendUser?.id}>
                Voter
              </button>
            </form>

            <div className="mb-2 flex justify-between text-sm">
              <span>Oui: {stats.pctOui}%</span>
              <span>Non: {stats.pctNon}%</span>
            </div>
            <div className="w-full h-5 rounded-full overflow-hidden border">
              <div className="h-full bg-green-600 inline-block" style={{ width: `${stats.pctOui}%` }} />
              <div className="h-full bg-red-600 inline-block" style={{ width: `${stats.pctNon}%` }} />
            </div>

            {msg && <div className="mt-4 p-3 rounded bg-yellow-50">{msg}</div>}
          </div>
        </div>
      </SignedIn>
    </>
  );
}
