CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id),
    username VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO rooms (name) VALUES ('General'), ('Tech Talk'), ('Random');