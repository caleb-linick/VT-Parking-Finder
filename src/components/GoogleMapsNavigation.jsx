/**
 * GoogleMapsNavigation.jsx
 * 
 * This component provides a button to navigate to a parking lot using Google Maps.
 * Integrated into ParkingLotDetail.jsx to allow users to get directions.
 * 
 * Features:
 * - Opens Google Maps in a new tab with directions to the selected parking lot
 * - Handles different device types (mobile vs desktop)
 * - Provides visual feedback while loading
 * 
 * @author VT Parking Finder Team
 * @version 1.1.0
 */

import React, { useState } from 'react';

/**
 * Component that renders a button for Google Maps navigation
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Name of the parking lot
 * @param {Array} props.coordinates - [latitude, longitude] of the parking lot
 * @param {string} props.address - The address of the parking lot (optional)
 * @returns {JSX.Element} A button that opens Google Maps navigation
 */
const GoogleMapsNavigation = ({ name, coordinates, address }) => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Opens Google Maps with directions to the parking lot
   * Handles both mobile and desktop platforms
   */
  const openGoogleMaps = () => {
    if (!coordinates || coordinates.length !== 2) {
      console.error('Invalid coordinates provided');
      return;
    }

    setIsLoading(true);

    // Extract latitude and longitude
    const [latitude, longitude] = coordinates;
    
    // Create the destination string (prefer address if available)
    const destination = address 
      ? encodeURIComponent(address)
      : `${latitude},${longitude}`;
    
    // Create the location name for display
    const locationName = encodeURIComponent(name);

    // Detect if device is mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Different URL formats for mobile vs desktop
    let mapsUrl;
    if (isMobile) {
      // Mobile Google Maps app URL (will open in the app if installed)
      mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${locationName}`;
    } else {
      // Desktop Google Maps URL
      mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    }
    
    // Open Google Maps in a new tab
    window.open(mapsUrl, '_blank');
    
    // Reset loading state after a short delay
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <button 
      onClick={openGoogleMaps} 
      style={styles.button}
      disabled={isLoading}
      aria-label={`Get directions to ${name} using Google Maps`}
    >
      {isLoading ? (
        <span style={styles.loadingText}>Opening Maps...</span>
      ) : (
        <>
          <span style={styles.icon}>📍</span>
          <span>Navigate to this Parking Lot</span>
        </>
      )}
    </button>
  );
};

/**
 * Component styles
 */
const styles = {
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4', // Google blue
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 15px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    width: '100%',
    marginTop: '10px',
  },
  icon: {
    marginRight: '8px',
    fontSize: '18px',
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
  },
};

export default GoogleMapsNavigation;