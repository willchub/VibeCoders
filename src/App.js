import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MarketplacePage from './pages/MarketplacePage';
import './assets/styles/main.css';

// Placeholder components for other pages
const HomePage = () => <MarketplacePage />; // For now, home is the marketplace
const LoginPage = () => <div style={{textAlign: 'center', padding: '50px', fontSize: '2rem'}}>Login Page</div>;
const RegisterPage = () => <div style={{textAlign: 'center', padding: '50px', fontSize: '2rem'}}>Register Page</div>;
const SellerDashboardPage = () => <div style={{textAlign: 'center', padding: '50px', fontSize: '2rem'}}>Seller Dashboard</div>;


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/seller-dashboard" element={<SellerDashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
