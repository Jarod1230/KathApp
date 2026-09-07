import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'quiet';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-bg hover:brightness-95',
  secondary: 'border border-border bg-surface text-text hover:border-muted',
  quiet: 'text-muted hover:text-text',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Disables the control and marks it busy while a request is in flight. */
  busy?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  busy = false,
  disabled,
  type,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      // Defaults to "button": an unmarked button inside a form submits it,
      // which is rarely what a secondary control means to do.
      type={type ?? 'button'}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`rounded-sm px-3 py-2 text-sm font-medium transition-[filter,color,border-color] disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
