from flask import Flask, render_template, request, redirect, url_for, session
import mysql.connector
import db as database_module

app = Flask(__name__, template_folder='pages')

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

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    if database_module.authenticate(mydb, username, password):
        session['username'] = username
        return redirect(url_for('update')) # redirect to a user page?
    else:
        return "Incorrect Password or Username. Try again", 401

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


@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))


@app.route('/occupancy', methods=['PUT'])
def update_occupancy():
    
    if request.method == 'PUT':
        print('inside')
        data = request.data
        # spot_id = request.form["id"]
        # spot_occupancy = request.form['occupancy']
        database_module.update_entity(mydb, data)
            
        return "Data is updated"


if __name__ == '__main__':
    app.run(debug=True)
