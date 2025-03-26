import psycopg2

import json
from hashlib import sha256

hostname = 'localhost'
database = 'test'
username = 'postgres'
password = 'testpassword'
port_id = 5432
conn = None
cur = None


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
    mycursor = mydb.cursor()
    hashed_password = sha256(password.encode()).hexdigest()
    try:
        mycursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, hashed_password))
        user = mycursor.fetchone() 
        print(user)
        return bool(user)  
    finally:
        mycursor.close()

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

# Insert ultrasonic sensor status (True/False) into database
def insert_sensor_status(mydb, is_occupied):
    cur = mydb.cursor()
    cur.execute("INSERT INTO sensor_data (is_occupied) VALUES (%s)", (is_occupied,))
    mydb.commit()
    # cur.close()    
    return 'complete'


# # Run serial data reading
# if __name__ == "__main__":
#     read_from_serial()
