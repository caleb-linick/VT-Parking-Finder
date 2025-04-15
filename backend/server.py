from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_cors import CORS
import mysql.connector
import db as database_module

app = Flask(__name__, template_folder='pages')
CORS(app)  # Enable CORS for all routes

mydb = database_module.connectdatabase()

session = {}

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

    if database_module.authenticate(mydb, username, password):
        session['username'] = username
        car_info = database_module.get_user_info(mydb, username)
        return jsonify({'status': 'success', 'car': car_info[0] if car_info else ''}), 200
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
        if database_module.signup_user(mydb, username, password):
            session['username'] = username
            return jsonify({'status': 'success'}), 200
        else:
            return "Signup Failed", 400
    except mysql.connector.IntegrityError as e:
        return f"This user already has an account. Please sign in.", 500

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))

# Occupancy endpoint (accepts JSON)
@app.route('/occupancy', methods=['PUT'])
def update_occupancy():
    if request.method == 'PUT':
        data = request.get_data(as_text=True)
        database_module.update_entity(mydb, data)
        return "Occupancy updated", 200

# Car update endpoint (accepts JSON)
@app.route('/car', methods=['PUT'])
def update_car():
    username = session.get('username')
    if not username:
        return "Not logged in", 401

    if request.method == 'PUT':
        data = request.get_data(as_text=True)
        database_module.update_car(mydb, data, username)
        return "Car updated", 200
    
@app.route('/favorites', methods=['GET'])
def get_favorites():
    username = session.get('username')
    if not username:
        return "Unauthorized", 401

    user_id = database_module.get_user_id(mydb, username)
    favorites = database_module.get_user_favorites(mydb, user_id)
    return jsonify(favorites)

@app.route('/favorites', methods=['POST'])
def update_favorites():
    username = session.get('username')
    if not username:
        return "Unauthorized", 401

    data = request.get_json()
    new_favorites = data.get('favorites', [])

    user_id = database_module.get_user_id(mydb, username)
    database_module.set_user_favorites(mydb, user_id, new_favorites)
    return "Favorites updated", 200


# Test route
#@app.route('/api/test')
#def test():
    #return jsonify({'status': 'connected', 'message': 'Flask + React are talking'}), 200

        # Pass sensor_id to the database module
    #    database_module.insert_ultrasonic_data(mydb, distance, is_occupied, sensor_id)
    #    return {"status": "success"}, 200
    #except Exception as e:
    #    print("Error:", e)
    #    return {"status": "error", "message": str(e)}, 500

@app.route('/upload', methods=['POST'])
def receive_sensor_data():
     try:
         data = request.get_json()
         distance = data.get("distance")
         is_occupied = data.get("is_occupied")
         print(f"Received sensor data: distance={distance}, is_occupied={is_occupied}")
 
         database_module.insert_ultrasonic_data(mydb, distance, is_occupied)
         return {"status": "success"}, 200
     except Exception as e:
         print("Error:", e)
         return {"status": "error", "message": str(e)}, 500
        
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)  # Accessible on your local network
