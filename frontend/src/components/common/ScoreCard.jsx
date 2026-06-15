import Card from './Card';

export default function ScoreCard({ title, value = 0, details = [], progress = 0, footer = null }) {
  const percent = Math.max(0, Math.min(100, Number(progress) || 0));

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</div>
          <div className="mt-2 text-4xl font-black text-slate-900">{value}%</div>
        </div>
        <div className="relative h-20 w-20 shrink-0">
          <div className="absolute inset-0 rounded-full border-8 border-slate-100" />
          <div
            className="absolute inset-0 rounded-full border-8 border-[color:var(--color-primary)] border-r-transparent"
            style={{ transform: `rotate(${Math.max(percent - 25, 0) * 3.6}deg)` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">{percent}%</div>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        {details.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{item.label}</span>
            <span className="font-semibold text-slate-800">{item.value}</span>
          </div>
        ))}
      </div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </Card>
  );
}
