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
 * @version 1.2.0
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';

// Sample data for parking lots - in production, this would come from an API
const parkingLots = [
  { id: 1, name: 'Perry Street Garage', openSpots: 45, totalSpots: 120 },
  { id: 2, name: 'Cassell Lot', openSpots: 0, totalSpots: 80 },
  { id: 3, name: 'Litton Reaves', openSpots: 35, totalSpots: 60 },
  { id: 4, name: 'Squires', openSpots: 5, totalSpots: 40 },
  { id: 5, name: 'Architecture Annex', openSpots: 20, totalSpots: 30 }
];

/**
 * Component that displays a user's favorite parking lots with improved error handling
 * 
 * @returns {JSX.Element} The rendered favorite parking component
 */
const FavoriteParking = () => {
  // State for user's favorite parking lots and UI states
  const [userFavorites, setUserFavorites] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Check if user is logged in on component mount using JWT
   */
  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuth = apiService.isAuthenticated();
      setIsLoggedIn(isAuth);
    };
    
    checkAuthStatus();
  }, []);

  /**
   * Fetch user favorites when logged in
   */
  useEffect(() => {
    if (isLoggedIn) {
      const fetchFavorites = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          // Use the centralized API service to fetch favorites
          const favorites = await apiService.getFavorites();
          
          // Map the spot IDs to the corresponding parking lot details
          const favoriteLots = parkingLots.filter(lot => favorites.includes(lot.id));
          
          // Updates the favorites
          setUserFavorites(favoriteLots);
          setRetryCount(0); // Reset retry count on success
        } catch (error) {
          console.error('Error fetching favorites:', error);
          
          // Set error message based on the error type
          if (error.response) {
            // Server responded with an error
            if (error.response.status === 401) {
              setError('Your session has expired. Please log in again.');
              // Clear auth data on authentication failure
              apiService.logout();
              setIsLoggedIn(false);
            } else {
              setError(`Failed to load favorites: ${error.response.data || 'Server error'}`);
            }
          } else if (error.request) {
            // No response received
            setError('Could not connect to the server. Please check your connection.');
            
            // Implement retry logic for network errors
            if (retryCount < 3) {
              setRetryCount(prev => prev + 1);
              setTimeout(() => {
                fetchFavorites();
              }, 2000 * (retryCount + 1)); // Exponential backoff
            }
          } else {
            // Request setup error
            setError('An unexpected error occurred. Please try again later.');
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchFavorites();
    }
  }, [isLoggedIn, retryCount]);

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
   * Render loading state
   */
  if (isLoading && userFavorites.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Your Favorite Parking Spots</h2>
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p>Loading your favorites...</p>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error && userFavorites.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Your Favorite Parking Spots</h2>
        <div style={styles.errorState}>
          <p>{error}</p>
          <button 
            onClick={() => setRetryCount(prev => prev + 1)} 
            style={styles.retryButton}
          >
            Try Again
          </button>
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
  loadingState: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '15px',
    borderRadius: '4px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  spinner: {
    width: '30px',
    height: '30px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTop: '3px solid #FFFFFF',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px',
  },
  errorState: {
    backgroundColor: 'rgba(255, 100, 100, 0.2)',
    padding: '15px',
    borderRadius: '4px',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    color: '#800000',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default FavoriteParking;