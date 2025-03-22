import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  headerContainer: {
    width: '100%',
    backgroundColor: '#600000', // Main header background
    padding: '20px 0',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    color: '#FFFFFF',
  },
  navBar: {
    width: '100%',
    backgroundColor: '#700000', // Navigation background
    display: 'flex',
    justifyContent: 'center',
    padding: '10px 0',
  },
  navLink: {
    color: '#FFFFFF',
    textDecoration: 'none',
    margin: '0 15px',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
};

const Header = () => {
  return (
    <>
      <div style={styles.headerContainer}>
        <h1 style={styles.title}>VT Parking Finder</h1>
      </div>
      <div style={styles.navBar}>
        <Link to="/" style={styles.navLink}>Home</Link>
        <Link to="/parking-lots" style={styles.navLink}>Parking Lots</Link>
        <Link to="/login" style={styles.navLink}>Login</Link>
      </div>
    </>
  );
};

export default Header;
