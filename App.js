// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import ParkingLots from './ParkingLots';
import Login from './Login';
import ParkingLotDetail from './ParkingLotDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/parking-lots" element={<ParkingLots />} />
        <Route path="/login" element={<Login />} />
        <Route path="/parking-lots/:id" element={<ParkingLotDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
