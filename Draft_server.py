from flask import Flask, render_template, request, redirect, url_for, session
import mysql.connector
import db as database_module
import serial
import threading

import datetime
x = datetime.datetime.now()

# Serial port settings (Update based on your system)
SERIAL_PORT = "COM4"  # Change to "/dev/ttyUSB0" for Linux/macOS
# SERIAL_PORT = "/dev/ttyUSB0"  # Change to "/dev/ttyUSB0" for Linux/macOS
BAUD_RATE = 9600

app = Flask(__name__, template_folder='pages')

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

# signup endpoint = Uses the data from the post request to make sure the pair is unused (yes = redirect to the next page, no = error)
@app.route('/signup', methods=['POST'])
def signup():
    username = request.form['username']
    password = request.form['password']
    
    if database_module.user_exists(mydb, username):
        return "This user already has an account", 409
    try:
        if database_module.signup_user(mydb, username, password):
            session['username'] = username
            return redirect(url_for('update')) # redirect to a user page?
        else:
            return "Signup Failed", 400
    except mysql.connector.IntegrityError as e:
        return f"THIS USER ALREADY HAS AN ACCOUNT. PLEASE SIGN IN", 500

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


# Read data from the Arduino through the serial port
def read_from_serial():
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    
    try:
        while True:
            line = ser.readline().decode('utf-8').strip()
            if line:
                try:
                    is_occupied = bool(int(line))  # Convert to boolean (0 -> False, 1 -> True)
                    print(f"Object detected: {is_occupied}")

                    # Store data in the database
                    # conn = connectdatabase()
                    database_module.insert_sensor_status(mydb, is_occupied)
                    database_module.update_entity(mydb)
                    # conn.close()
                except ValueError:
                    print("Invalid data received:", line)
    except KeyboardInterrupt:
        print("Stopping serial read")
    finally:
        ser.close()

def start_serial_thread():
    serial_thread = threading.Thread(target=read_from_serial)
    serial_thread.daemon = True
    serial_thread.start()

# Route for seeing a data
@app.route('/data')
def get_time():

    # Returning an api for showing in  reactjs
    return {
        'Name':"geek", 
        "Age":"22",
        "Date":x, 
        "programming":"python"
        }

if __name__ == '__main__':
    start_serial_thread()
    app.run(debug=True)
