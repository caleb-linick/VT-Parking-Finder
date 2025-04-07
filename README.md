# VT Parking Finder

A web application that helps Virginia Tech students, faculty, and visitors find available parking spots across campus.

## Features
- Real-time parking lot availability
- Interactive campus map with parking locations
- User accounts with favorite parking spots
- Car information storage
- Navigation to parking lots

## Technology Stack
- **Frontend**: React
- **Backend**: Flask
- **Database**: PostgreSQL

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- Python (v3.8 or higher)
- pip (latest version)
- PostgreSQL (v12 or higher)

### Frontend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/vt-parking-finder.git
   cd vt-parking-finder
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   npm install axios @react-google-maps/api concurrently
   ```

3. Create a proxy configuration:
   Add the following to your `package.json` file:
   ```json
   "proxy": "http://localhost:5000"
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install flask psycopg2 serial
   ```

4. Configure the database:
   - Create a PostgreSQL database
   - Update the database configuration in `db.py`:
     ```python
     hostname = 'localhost'
     database = 'your_database_name'
     username = 'your_username'
     password = 'your_password'
     port_id = 5432
     ```
   - Run the SQL setup script:
     ```bash
     psql -U your_username -d your_database_name -f db_file.sql
     ```

## Running the Application

Run both frontend and backend servers with a single command:
```bash
npm run start-all
```
Or directly:
```bash
node start.js
```

This script will:
1. Start the Flask backend server on port 5000
2. Start the React frontend server on port 3000 
3. Direct all output to a single console with color coding

### Option 2: Start Servers Separately

#### Start the Backend
```bash
# Navigate to the backend directory
cd backend

# Activate the virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Start the Flask server
python server.py
```

#### Start the Frontend
```bash
# In the project root directory
npm start
```

The frontend will be available at http://localhost:3000
The backend will be available at http://localhost:5000

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
│   ├── App.css              # Global styles
│   ├── App.js               # Main component
│   ├── index.js             # Entry point
│   └── ...
├── backend/                 # Flask backend
│   ├── db.py                # Database connection
│   ├── db_file.sql          # SQL setup script
│   ├── server.py            # Flask server
│   └── ...
├── package.json             # Dependencies
├── start.js                 # Combined startup script
└── README.md                # This file
```

## API Endpoints

| Endpoint | Method | Description | Request Format |
|----------|--------|-------------|----------------|
| `/login` | POST | User authentication | Form data (username, password) |
| `/signup` | POST | User registration | Form data (username, password) |
| `/car` | PUT | Update car information | JSON (model) |
| `/occupancy` | PUT | Update spot occupancy | JSON (spot_id, spot_occupancy) |
| `/logout` | GET | User logout | N/A |

## Development Notes
- Use `npm run start-all` during development to run both servers together
- API requests from the frontend are proxied to http://localhost:5000
- No need to specify the full URL in axios calls (e.g., use `/login` instead of `http://localhost:5000/login`)
- Check console output to see both server logs in one place
- Use browser developer tools to debug network requests
