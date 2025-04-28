# VT Parking Finder

A web application that helps Virginia Tech students, faculty, and visitors find available parking spots across campus with real-time availability data from IoT sensors.

## Overview

VT Parking Finder provides an intuitive interface for locating available parking spaces at Virginia Tech. The application combines real-time sensor data with user-friendly features to help users quickly find parking and reduce time spent searching for spots.

## Features

- **Real-time Parking Availability**: Live updates from ultrasonic sensors in parking spots
- **Interactive Campus Map**: Visual representation of parking lots with color-coded availability status
- **User Accounts**: Personalized experience with saved preferences
- **Favorite Parking Spots**: Save frequently used parking locations for quick access
- **Car Information Storage**: Store your vehicle details for easier identification
- **Navigation Integration**: One-click directions to parking lots via Google Maps
- **Detailed Lot Information**: View floor plans and spot-by-spot availability for parking garages
- **JWT Authentication**: Secure user authentication with token-based sessions

## Technology Stack

### Frontend
- **React**: Component-based UI library for building the interface
- **React Router**: For application routing and navigation
- **Leaflet**: Interactive mapping library for campus map visualization
- **Axios**: Promise-based HTTP client for API requests
- **CSS-in-JS**: Styled components for component-specific styling

### Backend
- **Flask**: Python web framework for API endpoints
- **JWT Authentication**: JSON Web Tokens for secure user sessions
- **PostgreSQL**: Relational database for storing parking and user data
- **psycopg2**: PostgreSQL adapter for Python

### IoT Hardware
- **ESP32 Microcontrollers**: For sensor data collection and transmission
- **Ultrasonic Sensors**: To detect vehicle presence in parking spots
- **RESTful API Integration**: For sending sensor data to the backend

## Architecture

The application follows a modern three-tier architecture:

1. **Presentation Layer** (React frontend)
2. **Application Layer** (Flask API)
3. **Data Layer** (PostgreSQL + IoT Sensors)

Communication between the frontend and backend happens through RESTful API calls, while IoT sensors send parking status data to the server via HTTP POST requests.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- React (v18.2 or compatible version)
- Python (v3.8 or higher)
- pip (latest version)
- PostgreSQL (v12 or higher)
- Hardware sensors (for production deployment):
  - ESP32 microcontrollers
  - HC-SR04 ultrasonic sensors
  - WiFi connectivity

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/vt-parking-finder.git
   cd vt-parking-finder
   ```

2. **Set up the database**
   ```bash
   # Create PostgreSQL database
   psql -U postgres
   CREATE DATABASE test;
   \q

   # Initialize database tables
   # The tables will be created automatically on first run
   ```

3. **Configure the backend**
   ```bash
   # Edit database connection settings in db.py if needed
   # Default settings:
   # hostname = 'localhost'
   # database = 'test'
   # username = 'postgres'
   # password = 'testpassword'
   # port_id = 5432
   ```

4. **Run the application setup script**
   ```bash
   node start.js
   ```
   This script will:
   - Create a Python virtual environment
   - Install all required Python dependencies
   - Install Node.js dependencies
   - Start both frontend and backend servers

## Running the Application

### Development Mode
Run the application with a single command from the root directory of the project:
```bash
npm run start-all
```

This script will:
1. Start the Flask backend server on port 5000
2. Start the React frontend server on port 3000 
3. Direct all output to a single console with color coding

**Note:** You must be in the root directory of the project when running this command.

### Accessing the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
vt-parking-finder/
├── public/                  # Static files
├── src/                     # React source code
│   ├── components/          # React components
│   │   ├── FavoriteParking.jsx
│   │   ├── GoogleMapsNavigation.jsx
│   │   ├── Header.jsx
│   │   ├── HomePage.jsx
│   │   ├── InteractiveMap.jsx
│   │   ├── Login.jsx
│   │   ├── MapWithUpdatingCenter.jsx
│   │   ├── ParkingLotDetail.jsx
│   │   ├── ParkingLots.jsx
│   │   └── UserProfile.jsx
│   ├── services/
│   │   └── apiService.js     # Centralized API service with JWT handling
│   ├── App.css              # Global styles
│   ├── App.js               # Main component with routing
│   ├── index.js             # Entry point
│   └── ...
├── backend/                 # Flask backend
│   ├── db.py                # Database connection and operations
│   ├── db_file.sql          # SQL setup script with schema and test data
│   ├── server.py            # Flask server with API endpoints
│   ├── mock_sensor.py       # Simulation for ultrasonic sensors
│   ├── capstoneSensorCode.ino # Arduino/ESP32 code for hardware sensors
│   └── ...
├── package.json             # Dependencies and scripts
├── start.js                 # Combined startup script
└── README.md                # This file
```

## API Endpoints

| Endpoint | Method | Description | Auth Required | Request Format |
|----------|--------|-------------|---------------|----------------|
| `/login` | POST | User authentication | No | JSON (username, password) |
| `/signup` | POST | User registration | No | JSON (username, password) |
| `/logout` | GET | User logout | No | N/A |
| `/car` | PUT | Update car information | Yes | JSON (model) |
| `/favorites` | GET | Get user's favorite spots | Yes | N/A |
| `/favorites` | POST | Update user's favorites | Yes | JSON (favorites array) |
| `/occupancy` | PUT | Update spot occupancy | No | JSON (spot_id, spot_occupancy) |
| `/sensor-data` | GET | Get latest sensor data | No | Query param (sensor_id) |
| `/upload` | POST | Receive sensor data | No | JSON (sensor_id, distance, is_occupied) |
| `/health` | GET | API health check | No | N/A |

## Authentication Flow

The application uses JWT (JSON Web Token) for secure authentication:

1. User logs in with username/password
2. Server validates credentials and returns a JWT token
3. Client stores the token in localStorage
4. Token is included in the Authorization header for protected requests
5. Server validates the token for each protected endpoint
6. Token expires after 24 hours, requiring re-authentication

## Sensor Integration

The application integrates with ultrasonic sensors to detect parking space occupancy:

1. Sensors measure the distance to detect if a spot is occupied
2. Data is sent to the `/upload` endpoint
3. Server processes and stores the data
4. Frontend polls for updates to show real-time status

The ESP32 code for the ultrasonic sensors is available in `capstoneSensorCode.ino`. This can be flashed to ESP32 microcontrollers connected to HC-SR04 ultrasonic sensors for deployment in parking spaces.

## Development Notes

- Use `npm run start-all` during development to run both servers together
- API requests from the frontend are proxied to http://localhost:5000
- No need to specify the full URL in axios calls (e.g., use `/login` instead of `http://localhost:5000/login`)
- Check console output to see both server logs in one place
- Use browser developer tools to debug network requests
- The JWT secret is configured in `db.py` (Change the JWT_SECRET for production)

## Testing with Real Sensors

To test the application with real ultrasonic sensors:

1. Flash the ESP32 microcontroller with the code from `capstoneSensorCode.ino` using the Arduino IDE
2. Connect the HC-SR04 ultrasonic sensor to the ESP32 according to the following pinout:
   - Trigger Pin: GPIO 12
   - Echo Pin: GPIO 13
   - VCC: 5V or 3.3V (depending on your sensor)
   - GND: Ground
3. Ensure the ESP32 is connected to WiFi (modify the SSID in the code if necessary)
4. Start the application with `npm run start-all` from the project root directory
5. The sensors will automatically send data to the server when objects are detected
