import type { ReactNode } from "react";
import Header from "./Header";
import LegalLinks from "./LegalLinks";

export default function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-12">{children}</div>
      <footer className="pb-8 text-center text-xs">
        <LegalLinks className="text-[rgb(var(--muted))]" />
      </footer>
    </div>
  );
}
