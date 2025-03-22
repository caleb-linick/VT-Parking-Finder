import React from 'react';
import { useParams } from 'react-router-dom';

// Mapping of parking lot IDs to their names
const parkingLotNames = {
  1: 'Perry Street Garage',
  2: 'Coliseum Lot',
  3: 'Litton Reaves',
  4: 'Squires',
  5: 'Architecture Annex',
};

const ParkingLotDetail = () => {
  const { id } = useParams();
  const name = parkingLotNames[id] || `Lot ${id}`;

  return (
    <div style={{ padding: '20px', textAlign: 'center', color: '#FFFFFF', backgroundColor: '#800000', minHeight: '100vh' }}>
      <h2>{name}</h2>
      <p>Floor map and available spots for {name} will be displayed here.</p>
      {/* Sensor info will go here */}
    </div>
  );
};

export default ParkingLotDetail;
