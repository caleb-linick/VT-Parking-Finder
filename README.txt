db_file.sql = structure of the PostgreSQL DB, adds in test data
    - Spot Table: Stores all of the individual parking spots - attributes include: id, occupancy, type of parking spot, parking_id 
                (foreign key representing what parking lot/garage this is a part of)
    - Parking Table: Stores the parking garages/lots - attributes include: id, name, address, location (near what type of facilities of interest?) 
    - User Table: Stores all of the user account information - attributes include: id, username, password, car/model? (probably not this), role?, first name last name?
    
db.py = sets up connection to the PostgreSQL DB, handles all situations related to CRUD functions for the DB, handles user account sign up/log in = user authentication
server.py = endpoints (only if necessary)