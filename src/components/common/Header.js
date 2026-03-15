import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const linkClass = (path, currentPath, variant) => {
  const active = path === currentPath;
  if (variant === 'dark') {
    return `text-sm font-medium transition-colors ${active ? 'text-white' : 'text-zinc-400 hover:text-white'}`;
  }
  if (variant === 'warm') {
    return `text-sm font-medium transition-colors ${active ? 'text-brand-primary' : 'text-stone-600 hover:text-brand-secondary'}`;
  }
  return `text-sm font-medium transition-colors ${active ? 'text-brand-primary' : 'hover:text-brand-primary'}`;
};

const Header = ({ variant = 'light' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isBusiness, signOut } = useAuth();
  const dark = variant === 'dark';
  const warm = variant === 'warm';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'Account';

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-md border-b ${
        dark ? 'bg-white/5 border-white/10' : warm ? 'bg-amber-50/95 border-amber-200/50' : 'bg-white border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className={`font-sans text-2xl font-semibold tracking-tight ${
                dark ? 'text-white' : warm ? 'text-brand-secondary' : 'text-brand-secondary'
              }`}
            >
              LA<span className="text-brand-primary">st</span> Minute
            </Link>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            {isBusiness && (
              <Link to="/" className={linkClass('/', location.pathname, variant)}>
                My business
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/profile" className={linkClass('/profile', location.pathname, variant)}>
                My profile
              </Link>
            )}
            <Link to="/marketplace" className={linkClass('/marketplace', location.pathname, variant)}>
              Marketplace
            </Link>
            {isBusiness && (
              <Link to="/seller-dashboard" className={linkClass('/seller-dashboard', location.pathname, variant)}>
                Create listing
              </Link>
            )}
            {isAuthenticated && !isBusiness && (
              <Link to="/appointments" className={linkClass('/appointments', location.pathname, variant)}>
                My appointments
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <span
                  className={dark ? 'text-sm text-zinc-400' : warm ? 'text-sm text-stone-600' : 'text-sm text-brand-muted'}
                  title={user?.email}
                >
                  {displayName}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className={`inline-flex items-center gap-1 text-sm font-medium transition-all ${
                    dark ? 'text-zinc-400 hover:text-white' : warm ? 'text-stone-600 hover:text-brand-secondary' : 'text-brand-muted hover:text-brand-primary'
                  }`}
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={linkClass('/login', location.pathname, variant)}>
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={`inline-block text-sm font-medium px-5 py-2 rounded-full transition-all ${
                    warm ? 'bg-brand-secondary text-white hover:bg-brand-secondary/90' : 'bg-white text-zinc-950 hover:bg-zinc-100'
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <Menu className={`h-6 w-6 cursor-pointer ${dark ? 'text-white' : 'text-brand-secondary'}`} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
