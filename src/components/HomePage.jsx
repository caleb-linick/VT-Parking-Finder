/**
 * HomePage.jsx
 * 
 * This component serves as the landing page for the VT Parking Finder application.
 * It displays:
 * 1. A user's favorite parking spots (if logged in)
 * 2. Lists of most open and most full parking lots
 * 3. An interactive map showing all parking lots with their availability status
 * 
 * The component fetches and processes parking data to determine which lots have the most
 * available spaces and which are the most full, displaying the top 3 in each category.
 * 
 * @author VT Parking Finder Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import Header from './Header';
import InteractiveMap from './InteractiveMap';
import FavoriteParking from './FavoriteParking';

// Sample data for parking lots - needs to be changed in later (or we can keep it depending on we want to demo)
const parkingLotsData = [
  { id: 1, name: 'Perry Street Garage', openSpaces: 45, totalSpaces: 50 },
  { id: 2, name: 'Cassell Lot', openSpaces: 30, totalSpaces: 40 },
  { id: 3, name: 'Litton Reaves', openSpaces: 15, totalSpaces: 35 },
  { id: 4, name: 'Squires', openSpaces: 10, totalSpaces: 30 },
  { id: 5, name: 'Architecture Annex', openSpaces: 5, totalSpaces: 25 }
];

const HomePage = () => {
  // State for storing processed parking lot data
  const [mostOpenLots, setMostOpenLots] = useState([]);
  const [mostFullLots, setMostFullLots] = useState([]);

  /**
   * On component mount, process the parking lot data to determine
   * which lots have the most available spaces and which are the most full
   */
  useEffect(() => {
    // Sort lots by open spaces (descending) for most open
    const openLots = [...parkingLotsData].sort((a, b) => 
      b.openSpaces - a.openSpaces
    ).slice(0, 3); // Get top 3
    
    // Sort lots by fullness (ascending open spaces) for most full
    const fullLots = [...parkingLotsData].sort((a, b) => 
      a.openSpaces - b.openSpaces
    ).slice(0, 3); // Get top 3
    
    setMostOpenLots(openLots);
    setMostFullLots(fullLots);
  }, []);

  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        {/* Display user's favorite parking lots if logged in */}
        <FavoriteParking />
        
        {/* Display most open and most full parking lots */}
        <div style={styles.infoBoxesContainer}>
          {/* Most open parking lots section */}
          <div style={styles.infoBox}>
            <h3 style={styles.infoBoxTitle}>Most Open Parking Lots</h3>
            <ul style={styles.lotsList}>
              {mostOpenLots.map((lot) => (
                <li key={lot.id} style={styles.lotItem}>
                  <span>{lot.name}</span>
                  <span>{lot.openSpaces}/{lot.totalSpaces} spaces available</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Most full parking lots section */}
          <div style={styles.infoBox}>
            <h3 style={styles.infoBoxTitle}>Most Full Parking Lots</h3>
            <ul style={styles.lotsList}>
              {mostFullLots.map((lot) => (
                <li key={lot.id} style={styles.lotItem}>
                  <span>{lot.name}</span>
                  <span>{lot.openSpaces}/{lot.totalSpaces} spaces available</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Interactive map section */}
        <div style={styles.mapSection}>
          <div style={styles.mapContainer}>
            <InteractiveMap />
          </div>
          <div style={styles.legend}>
            <h3 style={styles.legendTitle}>Legend</h3>
            <div style={styles.legendItem}>
              <div style={styles.legendColor.red}></div>
              <span>Full</span>
            </div>
            <div style={styles.legendItem}>
              <div style={styles.legendColor.yellow}></div>
              <span>Some open</span>
            </div>
            <div style={styles.legendItem}>
              <div style={styles.legendColor.green}></div>
              <span>Available</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/**
 * Component styles using CSS-in-JS pattern
 * This keeps styles encapsulated with the component
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
  infoBoxesContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: '20px',
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#990000',
    margin: '0 10px',
    padding: '20px',
    borderRadius: '4px',
  },
  infoBoxTitle: {
    marginTop: 0,
    textAlign: 'center',
  },
  lotsList: {
    listStyle: 'none',
    padding: 0,
  },
  lotItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  },
  mapSection: {
    display: 'flex',
    width: '90%', // Increased from 80% for larger map display
    backgroundColor: '#EEEEEE',
    padding: '20px',
    borderRadius: '4px',
    color: '#333333',
    marginBottom: '30px', // Added margin for better spacing
  },
  mapContainer: {
    flex: 4, // Increased from 3 to give more space to the map
    height: '600px', // Increased from 400px for better visibility
  },
  legend: {
    flex: 1,
    padding: '20px',
    backgroundColor: '#DDDDDD',
    borderRadius: '4px',
    marginLeft: '20px',
    alignSelf: 'flex-start', // Align to top of container
  },
  legendTitle: {
    marginTop: 0,
    textAlign: 'center',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0',
  },
  legendColor: {
    red: {
      width: '20px',
      height: '20px',
      backgroundColor: 'red',
      marginRight: '10px',
    },
    yellow: {
      width: '20px',
      height: '20px',
      backgroundColor: 'yellow',
      marginRight: '10px',
    },
    green: {
      width: '20px',
      height: '20px',
      backgroundColor: 'green',
      marginRight: '10px',
    },
  },
};

export default HomePage;