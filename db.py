import psycopg2
import json
from hashlib import sha256

hostname = 'localhost'
database = 'test'
username = 'postgres'
password = 'iLikePandas1!'
port_id = 5432
conn = None
cur = None

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
