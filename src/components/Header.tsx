import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ToolsMenu from "./ToolsMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "../i18n/I18nContext";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-sm transition group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <span className="text-lg font-bold tracking-tight">
        PDF <span className="text-gradient">Garage</span>
      </span>
    </Link>
  );
}

export default function Header() {
  const { t } = useI18n();
  const { user, logout, loading } = useAuth();
  const { darkMode, toggleDark } = useTheme();
  const navigate = useNavigate();
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsButtonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="glass-nav">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          <button
            ref={toolsButtonRef}
            type="button"
            onClick={() => setToolsOpen((o) => !o)}
            aria-expanded={toolsOpen}
            aria-haspopup="menu"
            className={`nav-link flex items-center gap-1 rounded-lg px-3 py-2 ${toolsOpen ? "nav-link-active bg-brand/10" : ""}`}
          >
            {t("tools")}
            <svg
              className={`h-3.5 w-3.5 transition ${toolsOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <ToolsMenu open={toolsOpen} onClose={() => setToolsOpen(false)} anchorRef={toolsButtonRef} />
          <Link to="/pricing" className="nav-link rounded-lg px-3 py-2">
            {t("pricing")}
          </Link>
          <Link to="/about" className="nav-link rounded-lg px-3 py-2">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-1.5">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-1">
                  <Link to="/profile" className="btn-ghost hidden max-w-[120px] truncate sm:inline-flex" title={user.email}>
                    {user.name || user.email.split("@")[0]}
                  </Link>
                  <Link to="/profile" className="btn-ghost hidden sm:inline-flex">
                    {t("profile")}
                  </Link>
                  <button type="button" onClick={handleLogout} className="btn-ghost">
                    {t("logout")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-ghost">
                    {t("login")}
                  </Link>
                  <Link to="/signup" className="btn-primary !px-4 !py-2">
                    {t("signup")}
                  </Link>
                </div>
              )}
            </>
          )}
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggleDark}
            className="btn-ghost !p-2"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
