import { useEffect, useState } from "react";

interface GoogleSignInButtonProps {
  disabled?: boolean;
  returnTo?: string;
  authPage?: "login" | "signup";
}

export default function GoogleSignInButton({
  disabled,
  returnTo = "/profile",
  authPage = "login",
}: GoogleSignInButtonProps) {
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/config", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { google?: boolean }) => setConfigured(Boolean(data.google)))
      .catch(() => setConfigured(false));
  }, []);

  const startUrl = `/api/auth/google/start?returnTo=${encodeURIComponent(returnTo)}&authPage=${authPage}`;

  const startGoogle = () => {
    window.location.assign(startUrl);
  };

  return (
    <div className="space-y-3">
      {configured === false && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-200">
          <p className="font-medium text-amber-100">Google Sign-In is not set up yet</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-200/90">
            Add <code className="rounded bg-black/20 px-1">GOOGLE_CLIENT_ID</code> and{" "}
            <code className="rounded bg-black/20 px-1">GOOGLE_CLIENT_SECRET</code> to your{" "}
            <code className="rounded bg-black/20 px-1">.env</code> file, then restart{" "}
            <code className="rounded bg-black/20 px-1">npm run dev</code>.
          </p>
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs font-medium text-brand hover:underline"
          >
            Open Google Cloud Credentials →
          </a>
        </div>
      )}

      <button
        type="button"
        disabled={disabled || configured === null}
        onClick={startGoogle}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 text-sm font-medium transition hover:bg-[rgb(var(--card-hover))] disabled:opacity-50"
      >
        <GoogleIcon />
        {configured === null ? "Loading Google…" : "Continue with Google"}
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
