import React from 'react';
import Header from './Header';
import InteractiveMap from './InteractiveMap';

const HomePage = () => {
  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        <div style={styles.infoBox}>
          <p>Display a list of lots with most open spaces at the top = 3 lots</p>
        </div>
        <div style={styles.mapContainer}>
          <InteractiveMap />
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#800000',
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
  infoBox: {
    width: '80%',
    backgroundColor: '#990000',
    margin: '10px',
    padding: '20px',
    borderRadius: '4px',
  },
  mapContainer: {
    width: '80%',
    marginTop: '20px',
  },
};

export default HomePage;
