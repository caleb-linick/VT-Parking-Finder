from flask import Flask, render_template, request, redirect, url_for, session, jsonify, make_response
from flask_cors import CORS
import mysql.connector
import db as database_module
import functools

app = Flask(__name__, template_folder='pages')
CORS(app)  # Enable CORS for all routes

mydb = database_module.connectdatabase()

# Decorator for JWT authentication
def jwt_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        # If no token found, return unauthorized
        if not token:
            return jsonify({"error": "Authorization token is missing"}), 401
        
        # Verify the token
        payload = database_module.verify_jwt_token(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401
            
        # Add user_id to the request
        request.user_id = payload.get('user_id')
        request.username = payload.get('username')
        
        return f(*args, **kwargs)
    
    return decorated_function

@app.route('/update')
def update():
    return render_template('update.html')

@app.route('/user_auth')
def user_auth():
    return render_template('user_auth.html')

@app.route('/')
def index():
    return render_template('index.html')

# Login endpoint (handles JSON requests)
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return "Invalid request - no JSON body found", 400

    username = data.get('username')
    password = data.get('password')

    auth_result = database_module.authenticate(mydb, username, password)
    
    if auth_result.get('success'):
        # Return JWT token and user information
        car_info = database_module.get_user_info(mydb, username)
        response = {
            'status': 'success',
            'token': auth_result.get('token'),
            'user_id': auth_result.get('user_id'),
            'username': username,
            'car': car_info[1] if car_info else ''
        }
        return jsonify(response), 200
    else:
        return "Incorrect Password or Username. Try again", 401

# Signup endpoint (handles JSON requests)
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data:
        return "Invalid request - no JSON body found", 400

    username = data.get('username')
    password = data.get('password')

    if database_module.user_exists(mydb, username):
        return jsonify({"success": False, "error": "This user already has an account"}), 409
    try:
        result = database_module.signup_user(mydb, username, password)
        if result:
            response = {
                'status': 'success',
                'token': result.get('token'),
                'user_id': result.get('user_id'),
                'username': username,
                'car': result.get('car', '')
            }
            return jsonify(response), 200
        else:
            return "Signup Failed", 400
    except mysql.connector.IntegrityError as e:
        return f"This user already has an account. Please sign in.", 500

@app.route('/logout')
def logout():
    # With JWT, logout happens on the client side by removing the stored token
    return jsonify({"message": "Logout successful"}), 200

# Occupancy endpoint (accepts JSON)
@app.route('/occupancy', methods=['PUT'])
def update_occupancy():
    if request.method == 'PUT':
        data = request.get_data(as_text=True)
        database_module.update_entity(mydb, data)
        return "Occupancy updated", 200

# Car update endpoint (accepts JSON)
@app.route('/car', methods=['PUT'])
@jwt_required
def update_car():
    if request.method == 'PUT':
        data = request.get_data(as_text=True)
        database_module.update_car(mydb, data, request.user_id)
        return "Car updated", 200
    
@app.route('/favorites', methods=['GET'])
@jwt_required
def get_favorites():
    # Get favorites directly using the user_id from the JWT token
    favorites = database_module.get_user_favorites(mydb, request.user_id)
    return jsonify(favorites)

@app.route('/favorites', methods=['POST'])
@jwt_required
def update_favorites():
    data = request.get_json()
    new_favorites = data.get('favorites', [])

    # Update favorites directly using the user_id from the JWT token
    database_module.set_user_favorites(mydb, request.user_id, new_favorites)
    return "Favorites updated", 200

@app.route('/sensor-data', methods=['GET'])
def get_sensor_data():
    # Get sensor data for a specific sensor
    sensor_id = request.args.get('sensor_id', default=1, type=int)
    data = database_module.get_latest_sensor_data(mydb, sensor_id)
    
    if data:
        return jsonify(data)
    else:
        return jsonify({"error": "No sensor data available"}), 404

@app.route('/upload', methods=['POST'])
def receive_sensor_data():
    try:
        data = request.get_json()
        sensor_id = data.get("sensor_id")
        distance = data.get("distance")
        is_occupied = data.get("is_occupied")
        print(f"Received sensor data: sensor_id={sensor_id}, distance={distance}, is_occupied={is_occupied}")

        # Pass sensor_id to the database module
        result = database_module.insert_ultrasonic_data(mydb, distance, is_occupied, sensor_id)
        if result:
            return {"status": "success"}, 200
        else:
            return {"status": "error", "message": "Failed to insert data"}, 500
    except Exception as e:
        print("Error:", e)
        return {"status": "error", "message": str(e)}, 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200
        
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)  # Accessible on your local network