import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Dashboard</div>
      <div className="flex flex-col gap-2">
        <NavLink to="/dashboard" className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">Overview</NavLink>
        <NavLink to="/profile" className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">Profile</NavLink>
      </div>
    </aside>
  );
}
