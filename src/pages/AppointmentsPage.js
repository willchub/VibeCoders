import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading } = useAuth();
  const redirect = searchParams.get('redirect') || '/appointments';

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, redirect]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-brand-muted">Loading…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12 flex-grow w-full">
        <h1 className="font-sans text-3xl font-semibold text-brand-secondary tracking-tight mb-2 flex items-center gap-2">
          <Calendar className="h-8 w-8 text-brand-primary" />
          My appointments
        </h1>
        <p className="text-brand-muted text-sm mb-8">
          Bookings you complete will appear here. Sign in to see your appointments.
        </p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-brand-muted mb-6">You have no upcoming appointments.</p>
          <Link
            to="/marketplace"
            className="inline-block px-5 py-2.5 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/90"
          >
            Browse marketplace
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AppointmentsPage;
