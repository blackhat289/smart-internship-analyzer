import { Link, NavLink } from 'react-router-dom';
import { APP_NAME } from '../../utils/constants';
import Button from '../common/Button';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
  const { token, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[#17395f] bg-[#0F2D52]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-black tracking-tight text-white">
          {APP_NAME}
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className="text-sm text-white/90 transition hover:text-[color:var(--color-accent)]">Home</NavLink>
          <NavLink to="/resume-analysis" className="text-sm text-white/90 transition hover:text-[color:var(--color-accent)]">Resume Analysis</NavLink>
          <NavLink to="/dashboard" className="text-sm text-white/90 transition hover:text-[color:var(--color-accent)]">Dashboard</NavLink>
          <NavLink to="/profile" className="text-sm text-white/90 transition hover:text-[color:var(--color-accent)]">Profile</NavLink>
        </nav>
        {token ? <Button variant="secondary" onClick={logout}>Logout</Button> : <div className="h-10" />}
      </div>
    </header>
  );
}
