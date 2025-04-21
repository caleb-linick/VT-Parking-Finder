import psycopg2
import serial
import json
import jwt
import datetime
import os
import pathlib
from hashlib import sha256

# JWT Configuration with static secret for testing
JWT_SECRET = 'VT_Parking_Static_Test_Secret_Key_2025'
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

hostname = 'localhost'
database = 'test'
username = 'postgres'
password = 'testpassword'
port_id = 5432
conn = None
cur = None

# Serial port settings (Update based on your system)
# SERIAL_PORT = "COM4"  # Change to "/dev/ttyUSB0" for Linux/macOS
BAUD_RATE = 9600

def initialize_database(conn):
    """Initialize the database with tables from db_file.sql"""
    cur = conn.cursor()
    try:
        # Get the directory of the current file
        current_dir = pathlib.Path(__file__).parent.absolute()
        sql_file_path = os.path.join(current_dir, 'db_file.sql')
        
        # Read SQL from db_file.sql
        with open(sql_file_path, 'r') as file:
            sql_script = file.read()
        
        # Execute the SQL script
        cur.execute(sql_script)
        conn.commit()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")
        conn.rollback()
    finally:
        cur.close()

def ensure_tables_exist(conn):
    """Check if required tables exist and create them if they don't"""
    required_tables = ['users', 'parking', 'spot', 'sensor', 'ultrasonic_data', 'favorites']
    cur = conn.cursor()
    
    try:
        # Check each table existence
        for table in required_tables:
            cur.execute(f"SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = '{table}')")
            table_exists = cur.fetchone()[0]
            if not table_exists:
                print(f"Table '{table}' doesn't exist.")
                return False
        return True
    except Exception as e:
        print(f"Error checking tables: {e}")
        return False
    finally:
        cur.close()

# Connect to MySQL = returns a connection to the postgresql db
def connectdatabase():
    try:
        conn = psycopg2.connect(
            host = hostname,
            dbname = database,
            user = username,
            password = password,
            port = port_id
        )
        
        # Check if tables exist, if not initialize the database
        tables_exist = ensure_tables_exist(conn)
        if not tables_exist:
            print("Required tables don't exist, initializing database...")
            initialize_database(conn)
        
        return conn
    except psycopg2.OperationalError as e:
        print(f"Database connection error: {e}")
        print("Please make sure PostgreSQL is running and the database exists.")
        raise


# Used to execute simple queries using the connection
def querydb(querystr, conn):
    cur = conn.cursor()
    cur.execute(querystr)
    return cur.fetchall()

# Create JWT token for a user
def create_jwt_token(user_id, username):
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

# Verify JWT token and return user_id if valid
def verify_jwt_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token has expired
    except jwt.InvalidTokenError:
        return None  # Invalid token

# Used to authenticate the passwords by ensuring the username and encrypted password matches the pair stored in the database
def authenticate(mydb, username, password):
    #mycursor = mydb.cursor()
    hashed_password = sha256(password.encode()).hexdigest()
    cur = None
    try:
        cur = mydb.cursor()
        print(f"LOGIN ATTEMPT — username: '{username}', hashed_password: '{hashed_password}'")

        cur.execute("SELECT id, username FROM users WHERE username = %s AND password = %s", (username, hashed_password))
        user = cur.fetchone() 
        print(f"QUERY RESULT: {user}")  # debug output
        if user:
            # Generate JWT token
            token = create_jwt_token(user[0], user[1])
            return {'success': True, 'user_id': user[0], 'token': token}
        return {'success': False}
    except Exception as e:
        print("AUTH ERROR:", e)
        return {'success': False, 'error': str(e)}
    finally:
        if cur:
            cur.close()

# Used to get user info 
def get_user_info(mydb, username):
    mycursor = mydb.cursor()
    mycursor.execute("SELECT u.id, u.car FROM users u WHERE u.username = %s", (username,))
    return mycursor.fetchone()

# Used to implement sign up functionality (stores username and encrypted password as a pair in the users table)
def signup_user(mydb, username, password):
    mycursor = mydb.cursor()
    hashed_password = sha256(password.encode()).hexdigest()
    mycursor.execute("INSERT INTO users (username, password) VALUES (%s, %s) RETURNING id", (username, hashed_password))
    user_id = mycursor.fetchone()[0]
    mydb.commit()
    
    # Generate JWT token for the new user
    token = create_jwt_token(user_id, username)
    
    # Get user info
    user_info = get_user_info(mydb, username)
    
    return {'user_id': user_id, 'token': token, 'car': user_info[1] if user_info else None}

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

# Gets the user id from username
def get_user_id(mydb, username):
    mycursor = mydb.cursor()
    mycursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    result = mycursor.fetchone()
    mycursor.close()
    return result[0] if result else None

# Gets the user id from token
def get_user_id_from_token(token):
    payload = verify_jwt_token(token)
    if payload:
        return payload.get('user_id')
    return None

# Ensure favorites table exists
def ensure_favorites_table_exists(mydb):
    mycursor = mydb.cursor()
    mycursor.execute("""
    CREATE TABLE IF NOT EXISTS favorites (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id),
        spot_id BIGINT
    )
    """)
    mydb.commit()
    mycursor.close()

# Gets the user favorites
def get_user_favorites(mydb, user_id):
    ensure_favorites_table_exists(mydb)
    mycursor = mydb.cursor()
    mycursor.execute("SELECT spot_id FROM favorites WHERE user_id = %s", (user_id,))
    favorites = [row[0] for row in mycursor.fetchall()]
    mycursor.close()
    return favorites

# Sets the user favorites
def set_user_favorites(mydb, user_id, spot_ids):
    ensure_favorites_table_exists(mydb)
    mycursor = mydb.cursor()
    mycursor.execute("DELETE FROM favorites WHERE user_id = %s", (user_id,))
    for spot_id in spot_ids:
        mycursor.execute("INSERT INTO favorites (user_id, spot_id) VALUES (%s, %s)", (user_id, spot_id))
    mydb.commit()
    mycursor.close()

# Functionality for updating the car associated with an account, will be used when the user enters a car model into the form
def update_car(mydb, data, user_id):
    data_dict = json.loads(data)
    car_model = data_dict['model']

    mycursor = mydb.cursor()
    mycursor.execute('UPDATE users SET car = %s WHERE id = %s', (car_model, user_id))
    mydb.commit()
    return 'complete'

def insert_ultrasonic_data(mydb, distance, is_occupied, sensor_id):
    # Ensure the ultrasonic_data table exists
    cur = mydb.cursor()
    try:
        cur.execute("""
        CREATE TABLE IF NOT EXISTS ultrasonic_data (
            id BIGSERIAL NOT NULL PRIMARY KEY,
            distance FLOAT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_occupied BOOLEAN NOT NULL,
            sensor_id BIGINT
        )
        """)
        mydb.commit()
        
        # Now insert the data
        cur.execute(
            "INSERT INTO ultrasonic_data (sensor_id, distance, is_occupied) VALUES (%s, %s, %s)",
            (sensor_id, distance, is_occupied)
        )
        mydb.commit()
        return True
    except Exception as e:
        print(f"Error inserting ultrasonic data: {e}")
        return False
    finally:
        cur.close()

# Get the latest sensor data
def get_latest_sensor_data(mydb, sensor_id):
    cur = mydb.cursor()
    try:
        cur.execute("""
        SELECT is_occupied, distance, timestamp 
        FROM ultrasonic_data 
        WHERE sensor_id = %s 
        ORDER BY timestamp DESC 
        LIMIT 1
        """, (sensor_id,))
        result = cur.fetchone()
        if result:
            return {
                'is_occupied': result[0],
                'distance': result[1],
                'timestamp': result[2].isoformat() if result[2] else None
            }
        return None
    except Exception as e:
        print(f"Error getting sensor data: {e}")
        return None
    finally:
        cur.close()

# Run serial data reading
if __name__ == "__main__":
    print("Skipping for testing")
   # read_from_serial()