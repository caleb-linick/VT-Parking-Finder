import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


const parkingLots = [
  {
    id: 1,
    name: 'Perry Street Garage',
    position: [37.2312, -80.4263],
  },
  {
    id: 2,
    name: 'Cassell Lot',
    position: [37.2214, -80.4205],
  },
  {
    id: 3,
    name: 'Litton Reaves',
    position: [37.2220, -80.4267],
  },
  {
    id: 4,
    name: 'Squires',
    position: [37.2291, -80.4168],
  },
  {
    id: 5,
    name: 'Architecture Annex',
    position: [37.2283, -80.4158],
  },
];

const ParkingLotPreview = ({ lot }) => {
  return (
    <div style={styles.lotContainer}>
      <h2 style={styles.lotName}>
        <Link to={`/parking-lots/${lot.id}`} style={styles.lotLink}>
          {lot.name}
        </Link>
      </h2>
      <div style={styles.lotMap}>
        <MapContainer center={lot.position} zoom={17} style={{ height: '200px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={lot.position}>
            <Popup>{lot.name}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

const ParkingLots = () => {
  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        {parkingLots.map((lot) => (
          <ParkingLotPreview key={lot.id} lot={lot} />
        ))}
      </main>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#800000', // Maroon background
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
  lotContainer: {
    width: '80%',
    backgroundColor: '#990000',
    margin: '10px 0',
    padding: '20px',
    borderRadius: '4px',
  },
  lotName: {
    margin: '0 0 10px 0',
    fontSize: '1.5rem',
  },
  lotLink: {
    color: '#FFFFFF',
    textDecoration: 'none',
  },
  lotMap: {
    width: '100%',
    height: '200px',
  },
};

export default ParkingLots;
