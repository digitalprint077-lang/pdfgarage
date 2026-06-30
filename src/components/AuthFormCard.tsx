import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface AuthFormCardProps {
  title: string;
  footer: ReactNode;
  children: ReactNode;
}

export default function AuthFormCard({ title, footer, children }: AuthFormCardProps) {
  return (
    <div className="modern-card mx-auto w-full max-w-[420px] px-8 py-10 shadow-soft-lg">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-[rgb(var(--muted))]">{footer}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

export function AuthOrDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[rgb(var(--border))]" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className="bg-[rgb(var(--card))] px-3 text-[rgb(var(--muted))]">or</span>
      </div>
    </div>
  );
}

export const authInputClass = "input-modern";

export const authLabelClass = "mb-1.5 block text-sm font-medium";

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="font-medium text-brand hover:underline">
      {children}
    </Link>
  );
}
