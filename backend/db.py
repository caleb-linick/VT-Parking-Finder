import psycopg2
import serial
import json
from hashlib import sha256

hostname = 'localhost'
database = 'test'
username = 'postgres'
password = 'testpassword'
port_id = 5432
conn = None
cur = None

# Serial port settings (Update based on your system)
SERIAL_PORT = "COM4"  # Change to "/dev/ttyUSB0" for Linux/macOS
BAUD_RATE = 9600

# Connect to MySQL = returns a connection to the postgresql db
def connectdatabase():
    conn = psycopg2.connect(
        host = hostname,
        dbname = database,
        user = username,
        password = password,
        port = port_id
    )
    return conn

# Used to execute simple queries using the connection
def querydb(querystr, conn):
    cur = conn.cursor()
    cur.execute(querystr)
    return cur.fetchall()

# Used to authenticate the passwords by ensuring the username and encrypted password matches the pair stored in the database
def authenticate(mydb, username, password):
    #mycursor = mydb.cursor()
    hashed_password = sha256(password.encode()).hexdigest()
    cur = None
    try:
        cur = mydb.cursor()
        print(f"LOGIN ATTEMPT — username: '{username}', hashed_password: '{hashed_password}'")

        cur.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, hashed_password))
        user = cur.fetchone() 
        print(f"QUERY RESULT: {user}")  # debug output
        return bool(user)
    except Exception as e:
        print("AUTH ERROR:", e)
        return False
    finally:
        if cur:
            cur.close()

# Used to get user info 
def get_user_info(mydb, username):
    mycursor = mydb.cursor()
    mycursor.execute("SELECT u.car FROM users u WHERE u.username = %s", (username,))
    return mycursor.fetchone()

# Used to implement sign up functionality (stores username and encrypted password as a pair in the users table)
def signup_user(mydb, username, password):
    mycursor = mydb.cursor()
    hashed_password = sha256(password.encode()).hexdigest()
    mycursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_password))
    mydb.commit()
    return get_user_info(mydb, username)

# Function used whenever it is needed to check that the user exists in the users table
def user_exists(mydb, username):
    mycursor = mydb.cursor()
    mycursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    return bool(mycursor.fetchone())

# Functionality for updating the occupancy of a spot, will be used when the sensor detects a change and notifies the backend
def update_entity(mydb, data):
    data_dict = json.loads(data)
    id = data_dict['spot_id']
    occupancy = data_dict['spot_occupancy']

    print(id)
    print(occupancy)
    # data_dict = json.loads(data)
    mycursor = mydb.cursor()
    mycursor.execute('UPDATE spot SET occupancy = %s WHERE id = %s', (occupancy, id))
    mydb.commit()
    return 'complete'

# Functionality for updating the car associated with an account, will be used when the user enters a car model into the form
def update_car(mydb, data, username):
    data_dict = json.loads(data)
    car_model = data_dict['model']

    # print(id)
    # print(occupancy)
    # data_dict = json.loads(data)
    mycursor = mydb.cursor()
    mycursor.execute('UPDATE users SET car = %s WHERE username = %s', (car_model, username))
    mydb.commit()
    return 'complete'

def insert_ultrasonic_data(mydb, distance, is_occupied):
    cur = mydb.cursor()
    cur.execute(
        "INSERT INTO ultrasonic_data (distance, is_occupied) VALUES (%s, %s)",
        (distance, is_occupied)
    )
    mydb.commit()
    cur.close()

# Run serial data reading
if __name__ == "__main__":
    print("Skipping for testing")
   # read_from_serial()
