import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, Wallet, Heart, Calendar, LogOut } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/app/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, player, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 w-full">
        <Link to="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold text-green-600">ArenaBook</div>
        </Link>

        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className={`text-sm font-medium transition-colors hover:text-green-600 ${isActive('/dashboard') ? 'text-green-600' : 'text-gray-600'}`}>My Dashboard</Link>
          </nav>
        )}

        <div className="hidden md:flex items-center space-x-6">
          {!isActive('/arenas') && (
            <Link to="/arenas" className="text-sm font-medium transition-colors hover:text-green-600 text-gray-600">Browse Arenas</Link>
          )}
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border border-gray-200 hover:shadow-md transition-shadow bg-white">
                  <span className="text-sm font-medium text-gray-700">{player?.name?.split(' ')[0]}</span>
                  <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2"><Calendar className="h-4 w-4" />My Bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2"><Wallet className="h-4 w-4" />Wallet</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2"><Heart className="h-4 w-4" />My Arenas</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                  <LogOut className="h-4 w-4" />Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors px-3 py-2">Log in</Link>
              <Link to="/register">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 rounded-full px-5 font-semibold">Sign up</Button>
              </Link>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon"><Menu className="h-5 w-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {!isActive('/arenas') && (
              <DropdownMenuItem asChild><Link to="/arenas">Browse Arenas</Link></DropdownMenuItem>
            )}
            {isAuthenticated ? (
              <>
                <DropdownMenuItem asChild><Link to="/dashboard">My Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">Logout</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild><Link to="/login">Login</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/register">Sign Up</Link></DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
