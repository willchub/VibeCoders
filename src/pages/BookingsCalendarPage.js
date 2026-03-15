import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, List } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import BookingModal from './BookingModal';
import { getListings } from '../services/api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const TAB_CALENDAR = 'calendar';
const TAB_UPCOMING = 'upcoming';

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const BookingsCalendarPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_CALENDAR);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedListingForBooking, setSelectedListingForBooking] = useState(null);

  const handleBookClick = (listing) => {
    setSelectedListingForBooking(listing);
    setBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setBookingModalOpen(false);
    setSelectedListingForBooking(null);
  };

  const handleConfirmBooking = () => {
    handleCloseBookingModal();
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    getListings()
      .then((data) => {
        if (mounted) setListings(data || []);
      })
      .catch((err) => {
        if (mounted) setError(err?.message || 'Failed to load listings.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const now = useMemo(() => startOfDay(new Date()), []);

  const futureListings = useMemo(() => {
    return listings.filter((l) => {
      const t = l.appointmentTime ? new Date(l.appointmentTime) : null;
      return t && startOfDay(t) >= now && (l.status === 'available' || l.status == null);
    });
  }, [listings, now]);

  const byDate = useMemo(() => {
    const map = {};
    futureListings.forEach((l) => {
      const d = new Date(l.appointmentTime);
      const key = formatDateKey(d);
      if (!map[key]) map[key] = [];
      map[key].push({ ...l, time: formatTime(l.appointmentTime) });
    });
    Object.keys(map).forEach((k) => map[k].sort((a, b) => (a.time > b.time ? 1 : -1)));
    return map;
  }, [futureListings]);

  const calendarGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();
    const cells = [];
    for (let i = 0; i < startPad; i++) cells.push({ empty: true });
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayListings = byDate[key] || [];
      cells.push({ key, day: d, count: dayListings.length, list: dayListings });
    }
    return cells;
  }, [currentMonth, byDate]);

  const prevMonth = () => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
    setSelectedDateKey(null);
  };

  const nextMonth = () => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
    setSelectedDateKey(null);
  };

  const selectedList = selectedDateKey ? (byDate[selectedDateKey] || []) : [];
  const upcomingChronological = useMemo(() => {
    return [...futureListings].sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));
  }, [futureListings]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--brand-accent)]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-grow w-full">
        <div className="mb-8 glass-panel rounded-2xl border border-white/40 p-6 shadow-lg">
          <h1 className="font-sans text-3xl font-semibold text-brand-secondary tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-brand-primary" />
            Available bookings
          </h1>
          <p className="font-sans text-brand-muted text-sm mt-2">
            Preview upcoming slots. Use the calendar or list view below.
          </p>
        </div>

        {loading && (
          <div className="glass-panel-strong rounded-2xl border border-white/40 p-12 text-center shadow-lg">
            <p className="font-sans text-brand-muted">Loading listings…</p>
          </div>
        )}
        {error && (
          <div className="glass-panel rounded-2xl border border-red-200/60 bg-red-50/70 backdrop-blur-xl p-4 mb-6 shadow-lg">
            <p className="font-sans text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && futureListings.length === 0 && (
          <div className="glass-panel-strong rounded-2xl border border-white/40 p-10 text-center shadow-lg">
            <p className="font-sans text-brand-muted mb-5">No upcoming available bookings in the marketplace yet.</p>
            <Link
              to="/marketplace"
              className="inline-block px-6 py-3 rounded-xl bg-brand-primary text-white font-sans font-semibold hover:bg-brand-primary/90 transition-colors shadow-md border border-white/20"
            >
              Browse marketplace
            </Link>
          </div>
        )}

        {!loading && !error && futureListings.length > 0 && (
          <>
            <div className="flex rounded-2xl border border-white/40 bg-white/50 backdrop-blur-xl p-1.5 mb-6 shadow-lg">
              <button
                type="button"
                onClick={() => setActiveTab(TAB_CALENDAR)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-sans text-sm font-medium transition-all ${
                  activeTab === TAB_CALENDAR
                    ? 'bg-white/90 text-brand-primary shadow-md border border-white/60 backdrop-blur-sm'
                    : 'text-brand-muted hover:text-brand-secondary hover:bg-white/30'
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                Calendar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(TAB_UPCOMING)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-sans text-sm font-medium transition-all ${
                  activeTab === TAB_UPCOMING
                    ? 'bg-white/90 text-brand-primary shadow-md border border-white/60 backdrop-blur-sm'
                    : 'text-brand-muted hover:text-brand-secondary hover:bg-white/30'
                }`}
              >
                <List className="h-4 w-4" />
                Upcoming
              </button>
            </div>

            {activeTab === TAB_CALENDAR && (
              <>
                <div className="glass-panel-strong rounded-2xl border border-white/40 shadow-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/30 bg-white/40 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-2 rounded-xl text-brand-secondary hover:bg-brand-primary/10 transition-colors"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="font-sans font-semibold text-brand-secondary">
                      {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-2 rounded-xl text-brand-secondary hover:bg-brand-primary/10 transition-colors"
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-brand-muted border-b border-gray-100 pb-2 mb-2">
                      {WEEKDAYS.map((w) => (
                        <div key={w}>{w}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {calendarGrid.map((cell, i) => {
                        if (cell.empty) {
                          return <div key={`e-${i}`} className="aspect-square" />;
                        }
                        const isSelected = selectedDateKey === cell.key;
                        const hasSlots = cell.count > 0;
                        return (
                          <button
                            key={cell.key}
                            type="button"
                            onClick={() => setSelectedDateKey(isSelected ? null : cell.key)}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center font-sans text-sm transition-all ${
                              hasSlots
                                ? isSelected
                                  ? 'bg-brand-primary text-white shadow-lg ring-2 ring-brand-primary ring-offset-2 backdrop-blur-sm'
                                  : 'bg-white/50 text-brand-secondary hover:bg-white/80 hover:backdrop-blur-md border border-white/40'
                                : 'text-gray-400 hover:bg-white/30 hover:backdrop-blur-sm'
                            }`}
                          >
                            <span>{cell.day}</span>
                            {hasSlots && (
                              <span className="text-[10px] mt-0.5 font-medium">
                                {cell.count} {cell.count === 1 ? 'slot' : 'slots'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {selectedDateKey && (
                  <div className="mt-6 glass-panel-strong rounded-2xl border border-white/40 shadow-lg p-6">
                    <h2 className="font-sans text-lg font-semibold text-brand-secondary mb-4">
                      {selectedDateKey} — {selectedList.length} available
                    </h2>
                    <ul className="space-y-3">
                      {selectedList.map((l) => (
                        <li
                          key={l.id}
                          className="p-4 rounded-xl border border-white/40 bg-white/50 backdrop-blur-sm hover:bg-white/70 hover:border-brand-primary/30 transition-all shadow-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <Link
                                to={`/listing/${l.id}`}
                                className="font-sans font-medium text-brand-secondary hover:text-brand-primary hover:underline"
                              >
                                {l.title}
                              </Link>
                              <span className="font-sans text-brand-muted text-sm ml-2">— {l.seller}</span>
                              <span className="font-sans text-brand-primary text-sm font-medium ml-2">{l.time}</span>
                              <span className="block font-sans text-sm text-brand-muted mt-1">
                                ${l.discountedPrice} (was ${l.originalPrice})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleBookClick(l)}
                              className="shrink-0 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-sans font-semibold text-sm hover:bg-brand-primary/90 transition-colors shadow-md border border-white/20"
                            >
                              Book now
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {activeTab === TAB_UPCOMING && (
              <div className="glass-panel-strong rounded-2xl border border-white/40 shadow-lg p-6">
                <h2 className="font-sans text-lg font-semibold text-brand-secondary mb-4">Upcoming available slots</h2>
                <ul className="space-y-3">
                  {upcomingChronological.map((l) => {
                    const time = formatTime(l.appointmentTime);
                    const dateStr = formatDateKey(new Date(l.appointmentTime));
                    return (
                      <li
                        key={l.id}
                        className="p-4 rounded-xl border border-white/40 bg-white/50 backdrop-blur-sm hover:bg-white/70 hover:border-brand-primary/30 transition-all shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/listing/${l.id}`}
                              className="font-sans font-medium text-brand-secondary hover:text-brand-primary hover:underline"
                            >
                              {l.title}
                            </Link>
                            <span className="font-sans text-brand-muted text-sm ml-2">— {l.seller}</span>
                            <span className="font-sans text-brand-primary text-sm font-medium ml-2">{dateStr} {time}</span>
                            <span className="block font-sans text-sm text-brand-muted mt-1">
                              ${l.discountedPrice} (was ${l.originalPrice})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleBookClick(l)}
                            className="shrink-0 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-sans font-semibold text-sm hover:bg-brand-primary/90 transition-colors shadow-md border border-white/20"
                          >
                            Book now
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
      <BookingModal
        listing={selectedListingForBooking}
        isOpen={bookingModalOpen}
        onClose={handleCloseBookingModal}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
};

export default BookingsCalendarPage;
