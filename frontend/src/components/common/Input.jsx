export default function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-[color:var(--color-border)] bg-white/90 px-4 py-3 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-slate-400 focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-[rgba(15,76,129,0.12)] ${props.className || ''}`}
    />
  );
}
