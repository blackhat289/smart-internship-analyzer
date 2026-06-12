import { Link, NavLink } from 'react-router-dom';
import { APP_NAME } from '../../utils/constants';
import Button from '../common/Button';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
  const { token, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-black tracking-tight">{APP_NAME}</Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className="text-sm text-slate-600">Home</NavLink>
          <NavLink to="/resume-analysis" className="text-sm text-slate-600">Resume Analysis</NavLink>
          <NavLink to="/dashboard" className="text-sm text-slate-600">Dashboard</NavLink>
          <NavLink to="/profile" className="text-sm text-slate-600">Profile</NavLink>
        </nav>
        {token ? <Button onClick={logout}>Logout</Button> : <div className="h-10" />}
      </div>
    </header>
  );
}
