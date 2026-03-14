import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MarketplacePage from './pages/MarketplacePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import './index.css';

const HomePage = () => <MarketplacePage />;


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
