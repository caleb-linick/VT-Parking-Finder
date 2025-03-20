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

# Connect to MySQL (change password)
def connectdatabase():
    conn = psycopg2.connect(
        host = hostname,
        dbname = database,
        user = username,
        password = password,
        port = port_id
    )
    return conn

def querydb(querystr, conn):
    cur = conn.cursor()
    cur.execute(querystr)
    return cur.fetchall()

def authenticate(mydb, username, password):
    mycursor = mydb.cursor()
    hashed_password = sha256(password.encode()).hexdigest()
    try:
        mycursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, hashed_password))
        user = mycursor.fetchone() 
        print(user)
        return bool(user)  
    finally:
        mycursor.close()

def get_user_info(mydb, username):
    mycursor = mydb.cursor()
    mycursor.execute("SELECT u.car FROM users u WHERE u.username = %s", (username,))
    return mycursor.fetchone()

def signup_user(mydb, username, password):
    mycursor = mydb.cursor()
    hashed_password = sha256(password.encode()).hexdigest()
    mycursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_password))
    mydb.commit()
    return get_user_info(mydb, username)

def user_exists(mydb, username):
    mycursor = mydb.cursor()
    mycursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    return bool(mycursor.fetchone())


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

# Insert ultrasonic sensor status (True/False) into database
def insert_sensor_status(mydb, is_occupied):
    cur = mydb.cursor()
    cur.execute("INSERT INTO ultrasonic_status (is_occupied) VALUES (%s)", (is_occupied,))
    mydb.commit()
    cur.close()

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
                    conn = connectdatabase()
                    insert_sensor_status(conn, is_occupied)
                    conn.close()
                except ValueError:
                    print("Invalid data received:", line)
    except KeyboardInterrupt:
        print("Stopping serial read")
    finally:
        ser.close()


# Run serial data reading
if __name__ == "__main__":
    read_from_serial()