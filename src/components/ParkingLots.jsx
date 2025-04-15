/**
 * ParkingLots.jsx
 * 
 * This component displays a comprehensive view of all parking lots at Virginia Tech.
 * It provides:
 * 1. A list of all parking lots with their current status
 * 2. Detailed information for the selected parking lot
 * 3. An interactive map centered on the selected lot
 * 4. Functionality to add/remove lots from favorites
 * 
 * The component uses the MapWithUpdatingCenter component to ensure smooth
 * transitions when the selected parking lot changes.
 * 
 * @author VT Parking Finder Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import MapWithUpdatingCenter from './MapWithUpdatingCenter';
import 'leaflet/dist/leaflet.css';

// Mock data for parking lots - in production, this would come from an API
const parkingLots = [
  {
    id: 1,
    name: 'Perry Street Garage',
    position: [37.2312, -80.4263],
    availableSpots: 45,
    totalSpots: 120,
    status: 'Some Open'
  },
  {
    id: 2,
    name: 'Cassell Lot',
    position: [37.2214, -80.4205],
    availableSpots: 0,
    totalSpots: 80,
    status: 'Full'
  },
  {
    id: 3,
    name: 'Litton Reaves',
    position: [37.2220, -80.4267],
    availableSpots: 35,
    totalSpots: 60,
    status: 'Available'
  },
  {
    id: 4,
    name: 'Squires',
    position: [37.2291, -80.4168],
    availableSpots: 5,
    totalSpots: 40,
    status: 'Some Open'
  },
  {
    id: 5,
    name: 'Architecture Annex',
    position: [37.2283, -80.4158],
    availableSpots: 20,
    totalSpots: 30,
    status: 'Available'
  },
];

const ParkingLots = () => {
  // State for the currently selected parking lot
  const [selectedLot, setSelectedLot] = useState(null);
  
  // State for user's favorite parking lots
  const [userFavorites, setUserFavorites] = useState([]);
  
  // Hook for programmatic navigation
  const navigate = useNavigate();

  /**
   * Load user favorites from localStorage on component mount
   */
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.favorites) {
        setUserFavorites(user.favorites);
      }
    }
  }, []);

  /**
   * Initialize with the first lot selected when component mounts
   */
  useEffect(() => {
    if (parkingLots.length > 0 && !selectedLot) {
      setSelectedLot(parkingLots[0]);
    }
  }, []);

  /**
   * Check if a lot is in the user's favorites
   * @param {number} lotId - The ID of the parking lot to check
   * @returns {boolean} True if the lot is in favorites, false otherwise
   */
  const isFavorite = (lotId) => {
    return userFavorites.includes(lotId);
  };

  /**
   * Toggle a parking lot's favorite status
   * @param {number} lotId - The ID of the parking lot to toggle
   */
  const toggleFavorite = async (lotId) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Please log in to save favorites');
      return;
    }
    
    const user = JSON.parse(userStr);
    let favorites = user.favorites || [];
  
    // Compute the updated favorites list
    if (favorites.includes(lotId)) {
      // Remove the lot if it's already favorited
      favorites = favorites.filter(id => id !== lotId);
    } else {
      favorites.push(lotId);
    }
  
    // Send the new favorites list to the backend
    try {
      const response = await fetch('/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites })
      });
  
      if (response.ok) {
        // Update the user's object favorites 
        user.favorites = favorites;
        localStorage.setItem('user', JSON.stringify(user));
        setUserFavorites(favorites); 
      } else {
        console.error('Backend update failed:', response.status);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  /**
   * Handle selection of a parking lot from the list
   * @param {Object} lot - The parking lot object that was selected
   */
  const handleLotSelect = (lot) => {
    setSelectedLot(lot);
  };

  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        <div style={styles.contentContainer}>
          {/* Left panel: List of parking lots */}
          <div style={styles.listContainer}>
            <h2 style={styles.sectionTitle}>List of parking lots</h2>
            <ul style={styles.lotsList}>
              {parkingLots.map((lot) => (
                <li 
                  key={lot.id} 
                  style={{
                    ...styles.lotItem,
                    ...(selectedLot && selectedLot.id === lot.id ? styles.selectedLot : {})
                  }}
                >
                  {/* Clickable lot information */}
                  <div 
                    style={styles.lotItemContent} 
                    onClick={() => handleLotSelect(lot)}
                  >
                    <span style={styles.lotName}>{lot.name}</span>
                    <span 
                      style={{
                        ...styles.lotStatus,
                        backgroundColor: lot.status === 'Full' ? 'red' : 
                                        lot.status === 'Some Open' ? 'yellow' : 'green',
                        color: lot.status === 'Some Open' ? 'black' : 'white'
                      }}
                    >
                      {lot.status}
                    </span>
                  </div>
                  
                  {/* Favorite toggle button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent lot selection when clicking favorite button
                      toggleFavorite(lot.id);
                    }}
                    style={isFavorite(lot.id) ? styles.favoriteButton.active : styles.favoriteButton.default}
                    aria-label={isFavorite(lot.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFavorite(lot.id) ? '★' : '☆'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Right panel: Detailed information and map */}
          <div style={styles.detailContainer}>
            {selectedLot ? (
              <div>
                <h2 style={styles.detailTitle}>{selectedLot.name}</h2>
                <div style={styles.lotDetails}>
                  <p>Available Spots: {selectedLot.availableSpots}/{selectedLot.totalSpots}</p>
                  <p>Status: {selectedLot.status}</p>
                  <div style={styles.buttonContainer}>
                    {/* Link to detailed floor plan view */}
                    <Link 
                      to={`/parking-lots/${selectedLot.id}`} 
                      style={styles.viewDetailsButton}
                    >
                      View Floor Plan
                    </Link>
                    
                    {/* Favorite toggle button */}
                    <button
                      onClick={() => toggleFavorite(selectedLot.id)}
                      style={isFavorite(selectedLot.id) ? styles.favoriteButtonDetail.active : styles.favoriteButtonDetail.default}
                    >
                      {isFavorite(selectedLot.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                  </div>
                </div>
                
                {/* Interactive map centered on the selected lot */}
                <div style={styles.mapWrapper}>
                  <MapWithUpdatingCenter 
                    center={selectedLot.position}
                    zoom={17}
                    markers={[selectedLot]}
                    onMarkerClick={(id) => navigate(`/parking-lots/${id}`)}
                  />
                </div>
              </div>
            ) : (
              <div style={styles.noSelectionMessage}>
                <p>Select a parking lot to see details and floor plan</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

/**
 * Component styles
 */
const styles = {
  container: {
    backgroundColor: '#800000', // VT Maroon background
    minHeight: '100vh',
    margin: 0,
    padding: 0,
    color: '#FFFFFF',
    fontFamily: 'Arial, sans-serif',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  contentContainer: {
    display: 'flex',
    width: '90%',
    gap: '20px',
  },
  // Left panel styles
  listContainer: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    borderRadius: '4px',
    padding: '20px',
    color: '#333333',
  },
  sectionTitle: {
    textAlign: 'center',
    marginTop: 0,
  },
  lotsList: {
    listStyle: 'none',
    padding: 0,
  },
  lotItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    backgroundColor: '#FFFFFF',
    borderRadius: '4px',
    marginBottom: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  lotItemContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedLot: {
    backgroundColor: '#E0E0E0',
    borderLeft: '5px solid #800000',
  },
  lotName: {
    fontWeight: 'bold',
  },
  lotStatus: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  favoriteButton: {
    default: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#999999',
      fontSize: '24px',
      cursor: 'pointer',
      marginLeft: '10px',
      padding: '0 5px',
    },
    active: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#FFD700', // Gold color for active favorites
      fontSize: '24px',
      cursor: 'pointer',
      marginLeft: '10px',
      padding: '0 5px',
    }
  },
  // Right panel styles
  detailContainer: {
    flex: 2,
    backgroundColor: '#EEEEEE',
    borderRadius: '4px',
    padding: '20px',
    color: '#333333',
    minHeight: '500px',
  },
  detailTitle: {
    textAlign: 'center',
    marginTop: 0,
  },
  lotDetails: {
    backgroundColor: '#FFFFFF',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px',
  },
  viewDetailsButton: {
    display: 'inline-block',
    padding: '10px 15px',
    backgroundColor: '#800000',
    color: '#FFFFFF',
    textDecoration: 'none',
    borderRadius: '4px',
    textAlign: 'center',
    fontWeight: 'bold',
    flex: 1,
    marginRight: '10px',
  },
  favoriteButtonDetail: {
    default: {
      flex: 1,
      padding: '10px 15px',
      backgroundColor: '#333333',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    active: {
      flex: 1,
      padding: '10px 15px',
      backgroundColor: '#FFD700', // Gold
      color: '#333333',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
    }
  },
  mapWrapper: {
    width: '100%',
    height: '400px',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  noSelectionMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    color: '#666666',
    fontStyle: 'italic',
  },
};

export default ParkingLots;