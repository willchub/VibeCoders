import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import BookingModal from './BookingModal';
import { getListings } from '../services/api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 flex-grow w-full">
        <h1 className="font-sans text-3xl font-semibold text-brand-secondary tracking-tight mb-2 flex items-center gap-2">
          <CalendarIcon className="h-8 w-8 text-brand-primary" />
          Available bookings
        </h1>
        <p className="text-brand-muted text-sm mb-8">
          Calendar of upcoming available slots. Click a day to see listings you can book.
        </p>

        {loading && (
          <p className="text-brand-muted py-8">Loading listings…</p>
        )}
        {error && (
          <p className="text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{error}</p>
        )}

        {!loading && !error && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-2 rounded-lg hover:bg-gray-200 text-brand-secondary transition-colors"
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
                  className="p-2 rounded-lg hover:bg-gray-200 text-brand-secondary transition-colors"
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
                <div className="grid grid-cols-7 gap-1">
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
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors ${
                          hasSlots
                            ? isSelected
                              ? 'bg-brand-primary text-white ring-2 ring-brand-primary ring-offset-2'
                              : 'bg-brand-primary/10 text-brand-secondary hover:bg-brand-primary/20'
                            : 'text-gray-300 hover:bg-gray-50'
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
              <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-sans text-lg font-semibold text-brand-secondary mb-4">
                  {selectedDateKey} — {selectedList.length} available
                </h2>
                <ul className="space-y-3">
                  {selectedList.map((l) => (
                    <li key={l.id} className="p-4 rounded-xl border border-gray-100 hover:border-brand-primary/50 bg-white hover:bg-brand-accent/20 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/listing/${l.id}`}
                            className="font-medium text-brand-secondary hover:text-brand-primary hover:underline"
                          >
                            {l.title}
                          </Link>
                          <span className="text-brand-muted text-sm ml-2">— {l.seller}</span>
                          <span className="text-brand-primary text-sm font-medium ml-2">{l.time}</span>
                          <span className="block text-sm text-brand-muted mt-1">
                            ${l.discountedPrice} (was ${l.originalPrice})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleBookClick(l)}
                          className="shrink-0 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-semibold text-sm hover:bg-brand-primary/90 transition-colors"
                        >
                          Book now
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!loading && futureListings.length === 0 && (
              <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-brand-muted mb-4">No upcoming available bookings in the marketplace yet.</p>
                <Link to="/marketplace" className="inline-block px-5 py-2.5 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/90">
                  Browse marketplace
                </Link>
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
