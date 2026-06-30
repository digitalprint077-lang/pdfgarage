import { useState, useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
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
  invalid_state: "Sign-in session expired. Please try again.",
};

export default function SignupPage() {
  const { t } = useI18n();
  const { register, user, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [name, setName] = useState("");
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

  const returnTo = "/profile";

  if (!loading && user) {
    return <Navigate to={returnTo} replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(t("passwordMinLength"));
      return;
    }
    setSubmitting(true);
    try {
      await register(email, password, name);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("signupFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthFormCard
        title={t("signup")}
        footer={
          <>
            {t("haveAccount")}{" "}
            <AuthLink to="/login">{t("login")}</AuthLink>
          </>
        }
      >
        <GoogleSignInButton disabled={submitting} returnTo={returnTo} authPage="signup" />

        <AuthOrDivider />

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className={authLabelClass}>
              {t("name")} <span className="text-gray-500">({t("optional")})</span>
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={authInputClass}
            />
          </div>
          <div>
            <label htmlFor="email" className={authLabelClass}>
              {t("emailOrUsername")}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className={authLabelClass}>
              {t("password")}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
            />
            <p className="mt-1 text-xs text-gray-500">{t("passwordHint")}</p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <p className="text-xs leading-relaxed text-gray-500">
            By creating an account, you agree to our{" "}
            <AuthLink to="/terms">Terms of Service</AuthLink> and{" "}
            <AuthLink to="/privacy">Privacy Policy</AuthLink>.
          </p>

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
