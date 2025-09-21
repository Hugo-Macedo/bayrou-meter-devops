import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

export default function Login() {
  const { isSignedIn, login, signup } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Bandeau si on vient de créer un compte
  useEffect(() => {
    if (params.get("created") === "1") {
      setMode("login");
      setMsg("Compte créé ✅ Connecte-toi maintenant.");
    }
  }, [params]);

  if (isSignedIn) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      if (mode === "signup") {
        await signup({ email, pseudo });
        // Redirection explicite vers /login avec un flag "created=1"
        navigate("/login?created=1", { replace: true });
        return;
      } else {
        await login({ email, pseudo });
      }
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen grid place-items-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Bayrou-Meter</h1>

        <div className="flex mb-6 rounded-xl overflow-hidden border">
          <button
            className={`flex-1 py-2 ${mode==='login'?'bg-black text-white':'bg-white'}`}
            onClick={()=>{ setMode("login"); setMsg(""); }}
          >Se connecter</button>
          <button
            className={`flex-1 py-2 ${mode==='signup'?'bg-black text-white':'bg-white'}`}
            onClick={()=>{ setMode("signup"); setMsg(""); }}
          >Créer un compte</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email" required
              className="w-full border rounded-xl px-3 py-2"
              value={email} onChange={e=>setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Pseudo</label>
            <input
              required minLength={2}
              className="w-full border rounded-xl px-3 py-2"
              value={pseudo} onChange={e=>setPseudo(e.target.value)}
            />
          </div>
          <button
            className="w-full bg-black text-white rounded-xl py-2 disabled:opacity-50"
            disabled={loading}
          >
            {mode==='signup' ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>

        {msg && <div className="mt-4 p-3 rounded bg-blue-50 text-blue-800 text-sm">{msg}</div>}
      </div>
    </div>
  );
}
