import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dark = variant === 'dark';
  const warm = variant === 'warm';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'Account';

  const mobileLinkClass = (path) => {
    const active = path === location.pathname;
    if (dark) return `block py-3 text-base font-medium ${active ? 'text-white' : 'text-zinc-300'}`;
    if (warm) return `block py-3 text-base font-medium ${active ? 'text-brand-primary' : 'text-stone-600'}`;
    return `block py-3 text-base font-medium ${active ? 'text-brand-primary' : 'text-zinc-600'}`;
  };

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
              <span
                className={`bg-clip-text text-transparent bg-gradient-to-r ${
                  dark ? 'from-white to-brand-primary' : 'from-zinc-900 to-brand-primary'
                }`}
              >
                Last Minute
              </span>
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
            <Link to="/bookings-calendar" className={linkClass('/bookings-calendar', location.pathname, variant)}>
              Calendar
            </Link>
            {isBusiness && (
              <Link to="/seller-dashboard" className={linkClass('/seller-dashboard', location.pathname, variant)}>
                Create listing
              </Link>
            )}
            {isAuthenticated && !isBusiness && (
              <>
                <Link to="/favourites" className={linkClass('/favourites', location.pathname, variant)}>
                  Favourites
                </Link>
                <Link to="/appointments" className={linkClass('/appointments', location.pathname, variant)}>
                  My appointments
                </Link>
              </>
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
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="p-2 rounded-lg hover:bg-black/5 focus:ring-2 focus:ring-brand-primary/30 outline-none"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className={`h-6 w-6 ${dark ? 'text-white' : 'text-brand-secondary'}`} />
              ) : (
                <Menu className={`h-6 w-6 ${dark ? 'text-white' : 'text-brand-secondary'}`} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-t ${dark ? 'border-white/10 bg-white/5' : warm ? 'border-amber-200/50 bg-amber-50/95' : 'border-gray-100 bg-white'}`}
          role="dialog"
          aria-label="Mobile navigation"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-1">
            {isBusiness && (
              <Link to="/" className={mobileLinkClass('/')} onClick={() => setMobileMenuOpen(false)}>
                My business
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/profile" className={mobileLinkClass('/profile')} onClick={() => setMobileMenuOpen(false)}>
                My profile
              </Link>
            )}
            <Link to="/marketplace" className={mobileLinkClass('/marketplace')} onClick={() => setMobileMenuOpen(false)}>
              Marketplace
            </Link>
            <Link to="/bookings-calendar" className={mobileLinkClass('/bookings-calendar')} onClick={() => setMobileMenuOpen(false)}>
              Calendar
            </Link>
            {isBusiness && (
              <Link to="/seller-dashboard" className={mobileLinkClass('/seller-dashboard')} onClick={() => setMobileMenuOpen(false)}>
                Create listing
              </Link>
            )}
            {isAuthenticated && !isBusiness && (
              <>
                <Link to="/favourites" className={mobileLinkClass('/favourites')} onClick={() => setMobileMenuOpen(false)}>
                  Favourites
                </Link>
                <Link to="/appointments" className={mobileLinkClass('/appointments')} onClick={() => setMobileMenuOpen(false)}>
                  My appointments
                </Link>
              </>
            )}
            <div className="pt-3 mt-3 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <p className={`py-2 text-sm ${dark ? 'text-zinc-400' : 'text-brand-muted'}`}>{displayName}</p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className={`inline-flex items-center gap-2 text-sm font-medium ${dark ? 'text-zinc-400' : 'text-brand-muted'}`}
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" className={mobileLinkClass('/login')} onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className={`inline-block text-center text-sm font-medium px-5 py-2.5 rounded-full ${warm ? 'bg-brand-secondary text-white' : 'bg-zinc-900 text-white'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
