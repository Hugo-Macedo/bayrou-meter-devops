import { SignIn, SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignedOut>
        <SignIn
          appearance={{ elements: { formButtonPrimary: "bg-black hover:opacity-90" } }}
          redirectUrl="/"
        />
      </SignedOut>
      <SignedIn>
        <Navigate to="/" replace />
      </SignedIn>
    </div>
  );
}
