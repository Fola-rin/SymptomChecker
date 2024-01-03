CREATE DATABASE symptopm_checker;

CREATE TABLE users (
    username VARCHAR(255),
    email VARCHAR(100) PRIMARY KEY,
    password_hash VARCHAR(100) NOT NULL,
    age INT,
    gender VARCHAR(10)
);

CREATE TABLE chats (
    chat_id SERIAL PRIMARY KEY,
    diagnosis TEXT NOT NULL,
    sender_email VARCHAR(100) REFERENCES users(email) ON DELETE CASCADE,
    chat_name
);

CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    chat_id INT REFERENCES chats(chat_id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL
);

