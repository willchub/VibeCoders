import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'Account';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="font-sans text-2xl font-semibold tracking-tight text-brand-secondary">
              LA<span className="text-brand-primary">st</span> Minute
            </Link>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              to="/marketplace"
              className={`text-sm font-medium transition-colors ${location.pathname === '/marketplace' ? 'text-brand-primary' : 'hover:text-brand-primary'}`}
            >
              Marketplace
            </Link>
            <Link to="/seller-dashboard" className="text-sm font-medium hover:text-brand-primary transition-colors">
              For Salons
            </Link>
            {isAuthenticated ? (
              <>
                <span className="text-sm text-brand-muted" title={user?.email}>
                  {displayName}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-sm font-medium text-brand-muted hover:text-brand-primary transition-colors flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium hover:text-brand-primary transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-brand-secondary text-white px-5 py-2 rounded-full hover:bg-opacity-90 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <Menu className="h-6 w-6 text-brand-secondary cursor-pointer" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
