/**
 * FavoriteParking.jsx
 * 
 * This component displays a user's favorite parking lots on the home page.
 * It provides quick access to lots the user frequently visits or wants to track.
 * 
 * Features:
 * - Shows a list of user's favorite parking lots with availability information
 * - Provides links to detailed views of each favorite lot
 * - Shows login prompt if user is not authenticated
 * - Shows empty state message if user has no favorites
 * - Displays real-time availability status for each favorite lot
 * 
 * @author VT Parking Finder Team
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Sample data for parking lots - in production, this would come from an API
const parkingLots = [
  { id: 1, name: 'Perry Street Garage', openSpots: 45, totalSpots: 120 },
  { id: 2, name: 'Cassell Lot', openSpots: 0, totalSpots: 80 },
  { id: 3, name: 'Litton Reaves', openSpots: 35, totalSpots: 60 },
  { id: 4, name: 'Squires', openSpots: 5, totalSpots: 40 },
  { id: 5, name: 'Architecture Annex', openSpots: 20, totalSpots: 30 }
];

/**
 * Component that displays a user's favorite parking lots
 * 
 * @returns {JSX.Element} The rendered favorite parking component
 */
const FavoriteParking = () => {
  // State for user's favorite parking lots and login status
  const [userFavorites, setUserFavorites] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /**
   * Load user data and favorite parking lots on component mount
   * Checks localStorage for user data and authentication status
   */
  useEffect(() => {
    // Check if user is logged in and get favorites
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsLoggedIn(true);
      
      // Get favorite lot details
      if (user.favorites && user.favorites.length > 0) {
        // Filter parkingLots to only include user's favorites
        const favoriteLots = parkingLots.filter(lot => 
          user.favorites.includes(lot.id)
        );
        setUserFavorites(favoriteLots);
      }
    }
  }, []);

  /**
   * Render login prompt if user is not authenticated
   */
  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Your Favorite Parking Spots</h2>
        <div style={styles.loginPrompt}>
          <p>Please <Link to="/login" style={styles.loginLink}>log in</Link> to see your favorite parking spots.</p>
        </div>
      </div>
    );
  }

  /**
   * Render empty state if user has no favorites
   */
  if (userFavorites.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Your Favorite Parking Spots</h2>
        <div style={styles.emptyState}>
          <p>You haven't added any favorite parking spots yet.</p>
          <p>Browse <Link to="/parking-lots" style={styles.link}>parking lots</Link> and add some to your favorites!</p>
        </div>
      </div>
    );
  }

  /**
   * Render user's favorite parking lots
   */
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Favorite Parking Spots</h2>
      <div style={styles.favoritesList}>
        {userFavorites.map(lot => (
          <div key={lot.id} style={styles.favoriteItem}>
            <div style={styles.favoriteInfo}>
              <h3 style={styles.lotName}>{lot.name}</h3>
              {/* Visual availability indicator */}
              <div style={styles.availabilityBar}>
                <div 
                  style={{
                    ...styles.availabilityFill,
                    width: `${(lot.openSpots / lot.totalSpots) * 100}%`,
                    backgroundColor: lot.openSpots === 0 ? 'red' : 
                                    lot.openSpots < lot.totalSpots / 3 ? 'yellow' : 'green'
                  }}
                ></div>
              </div>
              <p style={styles.availabilityText}>
                {lot.openSpots} of {lot.totalSpots} spots available
              </p>
            </div>
            {/* Link to detailed view */}
            <Link to={`/parking-lots/${lot.id}`} style={styles.viewButton}>
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Component styles
 */
const styles = {
  container: {
    width: '100%',
    backgroundColor: '#990000', // Slightly lighter than primary maroon
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  title: {
    margin: '0 0 15px 0',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  favoritesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  favoriteItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white
    padding: '15px',
    borderRadius: '4px',
  },
  favoriteInfo: {
    flex: 1,
  },
  lotName: {
    margin: '0 0 10px 0',
    fontSize: '1.2rem',
  },
  availabilityBar: {
    width: '100%',
    height: '10px',
    backgroundColor: '#333333', // Dark background for contrast
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '5px',
  },
  availabilityFill: {
    height: '100%',
    borderRadius: '5px',
    // Color is dynamically set based on availability
  },
  availabilityText: {
    margin: '5px 0 0 0',
    fontSize: '0.9rem',
  },
  viewButton: {
    backgroundColor: '#FFFFFF',
    color: '#800000', // VT Maroon
    padding: '8px 15px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  loginPrompt: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '15px',
    borderRadius: '4px',
    textAlign: 'center',
  },
  loginLink: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  link: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '15px',
    borderRadius: '4px',
    textAlign: 'center',
  },
};

export default FavoriteParking;