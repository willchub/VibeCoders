import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import GlassPageLayout, { GlassCard } from '../components/ui/GlassPageLayout';
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
      <GlassPageLayout>
        <p className="text-zinc-600">Loading…</p>
      </GlassPageLayout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <GlassPageLayout title="My appointments" subtitle="Bookings you complete will appear here." maxWidth="max-w-2xl">
      <GlassCard className="text-center">
        <Calendar className="h-12 w-12 text-brand-primary mx-auto mb-4" />
        <p className="text-zinc-600 mb-6">You have no upcoming appointments.</p>
        <Link to="/marketplace" className="inline-block px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-medium hover:bg-zinc-100">
          Browse marketplace
        </Link>
      </GlassCard>
    </GlassPageLayout>
  );
};

export default AppointmentsPage;
