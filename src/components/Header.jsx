/**
 * Header.jsx
 * 
 * This component renders the application header which appears on all pages.
 * It provides navigation links to all major sections of the application and
 * adapts based on the user's authentication state.
 * 
 * Features:
 * - Displays the application title
 * - Provides navigation links to Home, Parking Lots, and Login/Profile
 * - Highlights the active link based on the current route
 * - Conditionally shows Login or Profile link based on authentication status
 * 
 * @author VT Parking Finder Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Header component with navigation links and authentication-aware UI
 * 
 * @returns {JSX.Element} The rendered header component
 */
const Header = () => {
  const location = useLocation();
  
  // State to track authentication status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  /**
   * Determines if a navigation link should be highlighted as active
   * 
   * @param {string} path - The path to check against current location
   * @returns {boolean} Whether the path is active
   */
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  /**
   * Check user authentication status on component mount and route changes
   * Updates the UI based on whether the user is logged in
   */
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setIsLoggedIn(true);
      setUsername(userData.username || '');
    } else {
      setIsLoggedIn(false);
      setUsername('');
    }
  }, [location.pathname]); // Re-check when path changes
  
  return (
    <header>
      {/* Main header with title */}
      <div style={styles.headerContainer}>
        <h1 style={styles.title}>VT Parking Finder</h1>
      </div>
      
      {/* Navigation bar */}
      <nav style={styles.navBar}>
        {/* Home link */}
        <Link 
          to="/" 
          style={{
            ...styles.navLink,
            ...(isActive('/') ? styles.activeNavLink : {})
          }}
        >
          Home
        </Link>
        
        {/* Parking Lots link */}
        <Link 
          to="/parking-lots" 
          style={{
            ...styles.navLink,
            ...(isActive('/parking-lots') ? styles.activeNavLink : {})
          }}
        >
          Parking Lots
        </Link>
        
        {/* Conditional Login/Profile link based on authentication */}
        {isLoggedIn ? (
          <Link 
            to="/profile" 
            style={{
              ...styles.navLink,
              ...(isActive('/profile') ? styles.activeNavLink : {})
            }}
          >
            {username || 'Profile'}
          </Link>
        ) : (
          <Link 
            to="/login" 
            style={{
              ...styles.navLink,
              ...(isActive('/login') ? styles.activeNavLink : {})
            }}
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

/**
 * Component styles
 */
const styles = {
  headerContainer: {
    width: '100%',
    backgroundColor: '#600000', // VT Maroon (darker shade)
    padding: '20px 0',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  navBar: {
    width: '100%',
    backgroundColor: '#700000', // VT Maroon (slightly lighter than header)
    display: 'flex',
    justifyContent: 'center',
    padding: '15px 0',
  },
  navLink: {
    color: '#FFFFFF',
    textDecoration: 'none',
    margin: '0 15px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    padding: '8px 16px',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
  activeNavLink: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white for active link
  },
};

export default Header;