import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-card/90 shadow-[0_0_0_1px_rgba(61,255,176,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  href,
  variant = "primary",
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const styles = {
    primary:
      "bg-accent text-black hover:brightness-110 shadow-[0_0_24px_rgba(61,255,176,0.18)]",
    secondary:
      "bg-white/5 border border-line text-foreground hover:bg-white/10",
    ghost: "text-muted hover:text-foreground hover:bg-white/5",
    danger: "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
  }[variant];
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${styles} ${className}`;
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export const fieldClass =
  "w-full rounded-xl border border-line bg-[#0c1118] px-3 py-2.5 text-sm text-foreground outline-none ring-accent/40 placeholder:text-muted/70 focus:border-accent/60 focus:ring-2";

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "pink" | "warn" | "muted";
}) {
  const tones = {
    default: "border-line bg-white/5 text-foreground",
    accent: "border-accent/30 bg-accent/10 text-accent",
    pink: "border-accent-2/30 bg-accent-2/10 text-accent-2",
    warn: "border-warn/30 bg-warn/10 text-warn",
    muted: "border-line bg-white/5 text-muted",
  }[tone];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tones}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Card className="px-6 py-10 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}

export function Alert({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: "error" | "ok";
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-sm ${
        tone === "ok"
          ? "border-accent/30 bg-accent/10 text-accent"
          : "border-danger/30 bg-danger/10 text-danger"
      }`}
    >
      {children}
    </div>
  );
}

export function displayNameOf(user: {
  displayName?: string | null;
  name?: string | null;
  email?: string | null;
}) {
  return user.displayName || user.name || user.email?.split("@")[0] || "Player";
}
