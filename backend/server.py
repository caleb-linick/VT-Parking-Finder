from flask import Flask, render_template, request, redirect, url_for, session
import mysql.connector
import db as database_module

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

if __name__ == '__main__':
    app.run(debug=True)
