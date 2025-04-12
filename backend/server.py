from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_cors import CORS  # Import CORS
#import mysql.connector
import db as database_module

app = Flask(__name__, template_folder='pages')
CORS(app) #for multiple terminals

mydb = database_module.connectdatabase()

session = {}

# basic html component that is used to test updating the occupancy of the parking spot
@app.route('/update')
def update():
    return render_template('update.html')

# basic html component that is used to showcase the user sign up / log in functionality
@app.route('/user_auth')
def user_auth():
    return render_template('user_auth.html')

# basic html component that is used to showcase the home page
@app.route('/')
def index():
    return render_template('index.html')

# login endpoint = Uses the data from the post request and authenticates to make sure the pair is correct (yes = redirect to the next page, no = error)
@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    if database_module.authenticate(mydb, username, password):
        session['username'] = username
        return redirect(url_for('update')) # redirect to a user page?
    else:
        return "Incorrect Password or Username. Try again", 401
# login endpoint but through frontend
@app.route('/api/login', methods=['POST'])
def api_login():
    username = request.form['username']
    password = request.form['password']
    
    if database_module.authenticate(mydb, username, password):
        session['username'] = username
        return jsonify({ "success": True }), 200
    else:
        return jsonify({ "success": False, "error": "Invalid username or password" }), 401
    
# signup endpoint = Uses the data from the post request to make sure the pair is unused (yes = redirect to the next page, no = error)
@app.route('/signup', methods=['POST'])
def signup():
    username = request.form['username']
    password = request.form['password']
    
    if database_module.user_exists(mydb, username):
        return jsonify({"success": False, "error": "This user already has an account"}), 409
    try:
        user_info = database_module.signup_user(mydb, username, password)
        session['username'] = username
        return jsonify({"success": True, "message": "User created successfully"}), 200
    except Exception as e:
        print("Signup error:", e)
        return jsonify({"success": False, "error": "Signup failed"}), 500

# logout endpoint = only needs to pop the username and redirect back to the home page
@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))

# occupancy endpoint = used to update the occupancy on the makeshift html page by accepting input fields
@app.route('/occupancy', methods=['PUT'])
def update_occupancy():
    
    if request.method == 'PUT':
        print('inside')
        data = request.data
        # spot_id = request.form["id"]
        # spot_occupancy = request.form['occupancy']
        database_module.update_entity(mydb, data)
            
        return "Data is updated"

# update car endpoint = used to update the car associated with the account
@app.route('/car', methods=['PUT'])
def update_car():
    username = session['username']

    if request.method == 'PUT':
        print('inside')
        data = request.data
        # spot_id = request.form["id"]
        # spot_occupancy = request.form['occupancy']
        database_module.update_car(mydb, data, username)
            
        return "Data is updated"
@app.route('/upload', methods=['POST'])
def receive_sensor_data():
    try:
        data = request.get_json()
        sensor_id = data.get("sensor_id")
        distance = data.get("distance")
        is_occupied = data.get("is_occupied")
        print(f"Received sensor data: sensor_id={sensor_id}, distance={distance}, is_occupied={is_occupied}")

        # Pass sensor_id to the database module
        database_module.insert_ultrasonic_data(mydb, distance, is_occupied, sensor_id)
        return {"status": "success"}, 200
    except Exception as e:
        print("Error:", e)
        return {"status": "error", "message": str(e)}, 500

        
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)  # Accessible on your local network
