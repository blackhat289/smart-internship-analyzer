import { cn } from '../../utils/helpers';

export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-[color:var(--color-primary)] text-white hover:bg-[#0b3b63]',
    secondary: 'bg-white text-[color:var(--color-primary)] border border-[color:var(--color-border)] hover:bg-slate-50',
    ghost: 'bg-transparent text-[color:var(--color-text-secondary)] hover:bg-slate-100',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:ring-offset-2 disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
