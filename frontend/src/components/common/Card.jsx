export default function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[0_24px_70px_-40px_rgba(15,76,129,0.35)] ${className}`}
    >
      {children}
    </div>
  );
}
