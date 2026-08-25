"use client";

import { cn } from "@/lib/utils";

export function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-sm text-slate-600">
        <span>Step {step + 1} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-teal-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-6 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
    </div>
  );
}

export function OptionGrid({
  options,
  selected,
  onToggle,
  multi = true,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            className={cn(
              "rounded-lg border px-4 py-3 text-left text-sm transition-colors",
              isSelected
                ? "border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-600"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
            )}
            aria-pressed={isSelected}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function RadioGroup({
  options,
  value,
  onChange,
  name,
}: {
  options: { id: string; label: string }[];
  value?: string;
  onChange: (id: string) => void;
  name: string;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.id}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
            value === opt.id
              ? "border-teal-600 bg-teal-50 text-teal-900"
              : "border-slate-200 hover:bg-slate-50",
          )}
        >
          <input
            type="radio"
            name={name}
            value={opt.id}
            checked={value === opt.id}
            onChange={() => onChange(opt.id)}
            className="accent-teal-600"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 font-medium text-slate-800">{children}</p>;
}

export function ErrorMessage({ message }: { message: string }) {
  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}
