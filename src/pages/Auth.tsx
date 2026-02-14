import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const { user, isLoading, isConfigured, signInWithPassword, signUpWithPassword } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return <div className="max-w-xl mx-auto px-4 py-8 text-sm text-muted-foreground">Loading auth...</div>;
  }

  if (!isConfigured) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h1 className="font-display font-black text-2xl mb-3">Supabase is not configured</h1>
          <p className="text-sm text-muted-foreground">
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your
            environment and restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await signInWithPassword(email, password);
      } else {
        const result = await signUpWithPassword(email, password);
        if (result.needsEmailVerification) {
          setInfo("Account created. Check your inbox and verify your email before signing in.");
          setMode("signin");
        }
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Auth request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h1 className="font-display font-black text-2xl mb-1">{mode === "signin" ? "Sign in" : "Create account"}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Use email + password auth powered by Supabase.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {info ? <p className="text-sm text-primary">{info}</p> : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-muted-foreground">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-primary underline underline-offset-2"
          >
            {mode === "signin" ? "Create an account" : "Sign in instead"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
