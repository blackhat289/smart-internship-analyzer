export default function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-[1.6rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[0_18px_50px_-34px_rgba(15,76,129,0.28)] ${className}`}
    >
      {children}
    </div>
  );
}
