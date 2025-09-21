import { Link } from "react-router-dom";
import { useAuth } from "../auth";

export default function Header() {
  const { isSignedIn, user, logout, loading } = useAuth();

  return (
    <header className="fixed top-0 inset-x-0 h-14 bg-white/70 backdrop-blur border-b z-50">
      <div className="max-w-5xl mx-auto h-full flex items-center justify-between px-4">
        <Link to="/" className="font-semibold">Bayrou-Meter</Link>

        <div className="flex items-center gap-3">
          {loading ? (
            // Pendant la phase de vérification du token
            <span className="text-sm opacity-50">Chargement…</span>
          ) : isSignedIn ? (
            // Connecté
            <>
              <span className="text-sm opacity-70">
                {user?.pseudo} ({user?.email})
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-xl bg-black text-white"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <Link to="/login" className="px-3 py-1.5 rounded-xl border">
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
