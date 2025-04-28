import requests
import random
import time
import json

# Configuration
SERVER_URL = "http://localhost:5000/upload"  # Change to your server address
SENSOR_ID = 2  # Sensor ID 2 for Cassell lot
MOCK_DISTANCE_RANGE = (2, 100)  # Range of random distances in cm
DISTANCE_THRESHOLD = 10  # Same threshold as your real sensor
INTERVAL_SECONDS = 5  # How often to send data

def simulate_sensor():
    """Simulate an ultrasonic sensor sending data to the server"""
    
    print("Starting mock ultrasonic sensor for Cassell Lot...")
    print(f"Sending data to: {SERVER_URL}")
    print(f"Sensor ID: {SENSOR_ID}")
    print(f"Monitoring spot #1 in the Cassell Lot")
    print(f"Interval: {INTERVAL_SECONDS} seconds")
    print("Press Ctrl+C to stop")
    print("-" * 40)
    
    try:
        # Force default state to be unoccupied by sending initial reading
        initial_payload = {
            "sensor_id": SENSOR_ID,
            "distance": 50.0,  # Far distance = not occupied
            "is_occupied": False
        }
        
        print("Sending initial state (unoccupied)...")
        try:
            response = requests.post(
                SERVER_URL, 
                json=initial_payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                print(f"Initial state set: {response.json()}")
                print("Wait 10 seconds for state to propagate...")
                time.sleep(10)  # Give some time for the system to register
            else:
                print(f"Error: Server returned status code {response.status_code}")
                print(f"Response: {response.text}")
        except requests.RequestException as e:
            print(f"Connection error: {e}")
        
        print("Starting regular readings...")
        
        while True:
            # Generate random distance with greater variation
            # Force pattern: 3 readings occupied, 3 readings unoccupied
            current_time = int(time.time())
            cycle_position = (current_time // (INTERVAL_SECONDS * 3)) % 2
            
            if cycle_position == 0:
                # Force occupied state (close distance)
                distance = random.uniform(2, 8)
                is_occupied = True
            else:
                # Force unoccupied state (far distance)
                distance = random.uniform(50, 100)
                is_occupied = False
            
            # Prepare payload
            payload = {
                "sensor_id": SENSOR_ID,
                "distance": round(distance, 2),
                "is_occupied": is_occupied
            }
            
            # Print current reading
            print(f"Reading: distance={payload['distance']} cm | " 
                  f"Occupied: {is_occupied}")
            
            try:
                # Send data to server
                response = requests.post(
                    SERVER_URL, 
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                
                # Print server response
                if response.status_code == 200:
                    print(f"Server response: {response.json()}")
                    print(f"Cycle: {'Occupied' if cycle_position == 0 else 'Unoccupied'} phase")
                else:
                    print(f"Error: Server returned status code {response.status_code}")
                    print(f"Response: {response.text}")
            
            except requests.RequestException as e:
                print(f"Connection error: {e}")
            
            # Wait before next reading
            print("-" * 40)
            time.sleep(INTERVAL_SECONDS)
            
    except KeyboardInterrupt:
        print("\nMock sensor stopped")

if __name__ == "__main__":
    simulate_sensor()