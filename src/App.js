import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import CheckoutCancelPage from './pages/CheckoutCancelPage';
import ListingDetailPage from './pages/ListingDetailPage';
import AppointmentsPage from './pages/AppointmentsPage';
import BookingsCalendarPage from './pages/BookingsCalendarPage';
import BusinessSettingsPage from './pages/BusinessSettingsPage';
import ProfilePage from './pages/ProfilePage';
import FavouritesPage from './pages/FavouritesPage';
import './index.css';
import './assets/styles/main.css';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL || ''}>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/seller-dashboard" element={<SellerDashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/favourites" element={<FavouritesPage />} />
          <Route path="/business-settings" element={<BusinessSettingsPage />} />
          <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
          <Route path="/checkout-cancel" element={<CheckoutCancelPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/bookings-calendar" element={<BookingsCalendarPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
