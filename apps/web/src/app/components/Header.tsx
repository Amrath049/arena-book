import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, Wallet, Heart, Calendar, LogIn, LogOut } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold text-green-600">ArenaBook</div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className={`text-sm font-medium transition-colors hover:text-green-600 ${isActive('/') ? 'text-green-600' : 'text-gray-600'}`}>Home</Link>
          <Link to="/arenas" className={`text-sm font-medium transition-colors hover:text-green-600 ${isActive('/arenas') ? 'text-green-600' : 'text-gray-600'}`}>Browse Arenas</Link>
          {isAuthenticated && (
            <Link to="/dashboard" className={`text-sm font-medium transition-colors hover:text-green-600 ${isActive('/dashboard') ? 'text-green-600' : 'text-gray-600'}`}>My Dashboard</Link>
          )}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 font-medium">{player?.name?.split(' ')[0]}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon"><User className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
                    <LogOut className="h-4 w-4" />Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm" className="gap-2"><LogIn className="h-4 w-4" />Login</Button></Link>
              <Link to="/register"><Button size="sm" className="bg-green-600 hover:bg-green-700">Sign Up</Button></Link>
            </>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon"><Menu className="h-5 w-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild><Link to="/">Home</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/arenas">Browse Arenas</Link></DropdownMenuItem>
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
