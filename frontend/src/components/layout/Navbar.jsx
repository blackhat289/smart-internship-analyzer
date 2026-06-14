import { Link, NavLink } from 'react-router-dom';
import { APP_NAME } from '../../utils/constants';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#17395f] bg-gradient-to-r from-[#0b2340] via-[#0f2d52] to-[#123b6a] shadow-[0_10px_30px_rgba(7,18,34,0.28)]">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-2 py-4 sm:px-3">
        <Link
          to="/"
          className="group flex shrink-0 items-center text-3xl font-black tracking-tight text-white sm:text-4xl"
          aria-label="SkillSprint home"
        >
          <span className="relative inline-block text-transparent [text-shadow:0_1px_0_rgba(255,255,255,0.35),0_2px_0_rgba(0,0,0,0.18),0_8px_18px_rgba(0,0,0,0.28)] bg-gradient-to-b from-white via-[#f4f7ff] to-[#b9caff] bg-clip-text drop-shadow-[0_8px_14px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:-translate-y-0.5">
            {APP_NAME}
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-8 md:gap-10">
          <nav className="hidden items-center gap-6 md:ml-12 md:flex lg:ml-16">
            <NavLink to="/" className="text-sm font-medium text-white/90 transition hover:text-[color:var(--color-accent)]">Home</NavLink>
            <NavLink to="/resume-analysis" className="text-sm font-medium text-white/90 transition hover:text-[color:var(--color-accent)]">Resume Analysis</NavLink>
            <NavLink to="/dashboard" className="text-sm font-medium text-white/90 transition hover:text-[color:var(--color-accent)]">Dashboard</NavLink>
            <NavLink to="/profile" className="text-sm font-medium text-white/90 transition hover:text-[color:var(--color-accent)]">Profile</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
