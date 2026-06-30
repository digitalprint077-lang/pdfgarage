import { useState, useEffect } from "react";
import { Navigate, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import AuthFormCard, { AuthLink, AuthOrDivider, authInputClass, authLabelClass } from "../components/AuthFormCard";
import AuthPageShell from "../components/AuthPageShell";
import GoogleSignInButton from "../components/GoogleSignInButton";

const GOOGLE_ERRORS: Record<string, string> = {
  google_not_configured:
    "Google Sign-In is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env, then restart the server.",
  google_denied: "Google sign-in was cancelled.",
  google_failed: "Google sign-in failed. Please try again.",
  google_token_failed: "Google sign-in failed. Check your OAuth settings.",
  google_profile_failed: "Could not load your Google profile.",
  google_no_email: "Your Google account has no email address.",
  invalid_state: "Sign-in session expired. Please try again.",
};

export default function LoginPage() {
  const { t } = useI18n();
  const { login, user, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      setError(GOOGLE_ERRORS[err] || "Google sign-in failed.");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const returnTo =
    (location.state as { from?: string } | null)?.from?.startsWith("/") &&
    (location.state as { from?: string }).from !== "/login"
      ? (location.state as { from: string }).from
      : "/profile";

  if (!loading && user) {
    return <Navigate to={returnTo} replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loginFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthFormCard
        title={t("login")}
        footer={
          <>
            {t("noAccount")}{" "}
            <AuthLink to="/signup">{t("signup")}</AuthLink>
          </>
        }
      >
        <GoogleSignInButton disabled={submitting} returnTo={returnTo} authPage="login" />

        <AuthOrDivider />

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={authLabelClass}>
              {t("emailOrUsername")}
            </label>
            <input
              id="email"
              type="text"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-gray-200">
                {t("password")}
              </label>
              <button type="button" className="text-sm text-brand hover:underline">
                {t("forgotPassword")}
              </button>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full rounded-lg bg-brand py-3.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-50"
          >
            {submitting ? t("working") : t("continue")}
          </button>
        </form>
      </AuthFormCard>
    </AuthPageShell>
  );
}
