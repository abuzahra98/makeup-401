DROP TABLE IF EXISTS makeups;
CREATE TABLE makeups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    img VARCHAR(255),
    price VARCHAR(255),
    description TEXT
);