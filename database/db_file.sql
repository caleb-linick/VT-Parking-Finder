CREATE EXTENSION pgcrypto;

create table parking (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(250) NOT NULL,
    location VARCHAR(100) NOT NULL
);

CREATE TABLE sensor (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    sensor_type VARCHAR(100) NOT NULL,
    sensor_status VARCHAR(100) NOT NULL,
    last_checkup_date TIMESTAMP NOT NULL    
);

-- CREATE TABLE ultrasonic_data (
--     id SERIAL PRIMARY KEY,
--     distance FLOAT NOT NULL,
--     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

CREATE TABLE ultrasonic_data (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    distance FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_occupied BOOLEAN NOT NULL,
    sensor_id BIGINT REFERENCES sensor(id)
);

create table spot ( 
    id BIGSERIAL NOT NULL PRIMARY KEY,
    type VARCHAR(100),
    occupancy BOOLEAN NOT NULL,
    lot_id BIGINT REFERENCES parking(id),
    sensor_id BIGINT REFERENCES sensor(id)
    -- occupancy BOOLEAN REFERENCES sensor_data(is_occupied)
);

create table users ( 
    id BIGSERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password TEXT NOT NULL,
    car VARCHAR(100)
);

CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    spot_id BIGINT REFERENCES spot(id)
);



-- Parking Data
INSERT INTO parking (name, address, location) VALUES
('Perry Street Parking', 'Perry St, Blacksburg, VA', 'Virginia Tech'),
('Duck Pond Lot', 'Duck Pond Dr, Blacksburg, VA', 'Virginia Tech'),
('North End Garage', 'Turner St NW, Blacksburg, VA', 'Virginia Tech');

-- Sensor Data
INSERT INTO sensor (sensor_type, sensor_status, last_checkup_date) VALUES
('Ultrasonic Sensor', 'Operational', '2025-03-01 10:00:00'),
('Ultrasonic Sensor', 'Needs Maintenance', '2025-02-15 14:00:00'),
('Ultrasonic Sensor', 'Operational', '2025-03-20 16:00:00');

-- Spot Data with Updated Types
INSERT INTO spot (occupancy, type, lot_id, sensor_id) VALUES
(FALSE, 'Visitor Only', 1, 1),
(TRUE, 'Electric Vehicle', 1, 2),
(FALSE, 'Faculty', 2, 3),
(TRUE, 'Graduate Students', 3, 1),
(TRUE, 'Students with Parking Passes', 3, 2),
(FALSE, 'Free to Use by Anyone at Any Time', 2, 1);

-- insert into parking (name, address, location) values ('Perry Street Parking Garage', '1330 Perry Street, Blacksburg, VA, 24060', 'Virginia Tech');

-- insert into spot (occupancy, type) values (true, 'Regular spot');
-- insert into spot (occupancy, type) values (true, 'Regular spot');
-- insert into spot (occupancy, type) values (true, 'Regular spot');

insert into users (username, password, car) values ('test_user1', 'test_pass1', '2021 Honda Corolla');


