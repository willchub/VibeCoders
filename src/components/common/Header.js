import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className="main-header">
      <div className="logo">
        <Link to="/">LastMinute</Link>
      </div>
      <nav className="main-nav">
        <ul>
          <li><NavLink to="/marketplace">Marketplace</NavLink></li>
          <li><NavLink to="/seller-dashboard">For Business</NavLink></li>
          <li><NavLink to="/login">Login</NavLink></li>
          <li><NavLink to="/register" className="register-btn">Register</NavLink></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
