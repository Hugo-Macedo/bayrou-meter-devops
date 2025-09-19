import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 px-4 flex items-center justify-between border-b bg-white/70 backdrop-blur z-50">
      <Link to="/" className="font-semibold">Bayrou-Meter</Link>

      <div className="flex items-center gap-3">
        <SignedOut>
          <a href="/login" className="px-3 py-1 rounded bg-black text-white">
            Se connecter
          </a>
        </SignedOut>

        <SignedIn>
          {/* Ouvre le profil dans une modale, et déconnecte vers /login */}
          <UserButton
            afterSignOutUrl="/login"
            userProfileMode="modal"
            appearance={{ elements: { avatarBox: "ring-2 ring-black rounded-full" } }}
          />
        </SignedIn>
      </div>
    </header>
  );
}
