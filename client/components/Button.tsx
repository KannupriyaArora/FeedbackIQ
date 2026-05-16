import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 active:bg-indigo-600',
  secondary:
    'bg-slate-800 text-slate-100 hover:bg-slate-700 active:bg-slate-700/80 border border-slate-700',
  outline:
    'border border-slate-700 bg-slate-900/40 text-slate-200 hover:border-slate-500 hover:text-white hover:bg-slate-800/60',
};

export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
