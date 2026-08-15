import { clsx } from "clsx";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { DEPARTMENT_META, initials } from "@/lib/store";
import type { DepartmentId, Person } from "@/lib/types";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-leaf">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="display text-3xl leading-tight text-ink sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-ink-soft sm:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("card p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = {
    primary: "bg-leaf text-white hover:bg-leaf-deep",
    secondary: "bg-white text-ink border border-line hover:bg-paper",
    ghost: "bg-transparent text-ink-soft hover:bg-white/70",
    danger: "bg-coral text-white hover:opacity-90",
  } as const;
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Avatar({ person, size = "md" }: { person: Person; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "h-8 w-8 text-[11px]" : size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        dim,
      )}
      style={{ background: `hsl(${person.avatarHue} 42% 38%)` }}
      aria-hidden
    >
      {initials(person)}
    </div>
  );
}

export function DeptPill({ id }: { id: DepartmentId }) {
  const meta = DEPARTMENT_META[id];
  return (
    <span className="chip text-white" style={{ background: meta.tint }}>
      {meta.label}
    </span>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "draft";
}) {
  const map = {
    neutral: "bg-paper-deep text-ink",
    good: "bg-leaf-mist text-leaf-deep",
    warn: "bg-amber-100 text-amber-900",
    bad: "bg-red-100 text-red-800",
    draft: "bg-zinc-200 text-zinc-700",
  } as const;
  return <span className={cn("chip", map[tone])}>{children}</span>;
}

export function Empty({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <Card className="border-dashed text-center">
      <p className="display text-xl">{title}</p>
      <p className="mt-2 text-sm text-ink-soft">{body}</p>
    </Card>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">{label}</p>
      <p className="display mt-2 text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-sm text-ink-soft">{hint}</p> : null}
    </Card>
  );
}
