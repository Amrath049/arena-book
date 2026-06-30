import { Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const location = useLocation();
  const { isAuthenticated, player } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 w-full">
        <Link to="/" className="flex items-center space-x-1.5 group">
          <span className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>ARENA</span>
            <span className="text-emerald-600 font-black">BOOK</span>
          </span>
        </Link>

        <div className="flex items-center space-x-5">
          {!isActive('/arenas') && (
            <Link to="/arenas" className="text-sm font-semibold transition-colors hover:text-emerald-600 text-slate-600">Browse Arenas</Link>
          )}
          
          {isAuthenticated ? (
            <Link to="/dashboard" title="My Dashboard" className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all font-semibold text-sm cursor-pointer shadow-sm shadow-emerald-500/5">
              {player?.name ? player.name[0].toUpperCase() : <User className="h-4.5 w-4.5" />}
            </Link>
          ) : (
            <Link to="/login" title="Login / Register" className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer">
              <User className="h-4.5 w-4.5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
