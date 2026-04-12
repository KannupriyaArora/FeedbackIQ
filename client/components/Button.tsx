import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-violet-600 text-white hover:bg-violet-500 active:bg-violet-700',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300',
  outline: 'border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 bg-white',
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
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
