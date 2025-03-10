CREATE EXTENSION pgcrypto;

create table parking (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(250) NOT NULL,
    location VARCHAR(100) NOT NULL
);

create table spot ( 
    id BIGSERIAL NOT NULL PRIMARY KEY,
    occupancy BOOLEAN NOT NULL,
    type VARCHAR(100),
    lot_id BIGINT REFERENCES parking(id),
    UNIQUE(lot_id)
);

create table users ( 
    id BIGSERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password TEXT NOT NULL,
    car VARCHAR(100)
);

insert into parking (name, address, location) values ('Perry Street Parking Garage', '1330 Perry Street, Blacksburg, VA, 24060', 'Virginia Tech');

insert into spot (occupancy, type) values (true, 'Regular spot');
insert into spot (occupancy, type) values (true, 'Regular spot');
insert into spot (occupancy, type) values (true, 'Regular spot');

insert into users (username, password, car) values ('test_user1', 'test_pass1', '2021 Honda Corolla');


