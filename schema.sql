-- EcoTrack Database Schema
CREATE DATABASE IF NOT EXISTS ecotrack;
USE ecotrack;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_reset_token VARCHAR(255) DEFAULT NULL,
    password_reset_expiry DATETIME DEFAULT NULL,
    otp_code VARCHAR(6) DEFAULT NULL,
    otp_expiry DATETIME DEFAULT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Footprints table
CREATE TABLE IF NOT EXISTS footprints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    car_km DECIMAL(10,2) DEFAULT 0,
    bike_km DECIMAL(10,2) DEFAULT 0,
    flights DECIMAL(10,2) DEFAULT 0,
    meat_meals DECIMAL(10,2) DEFAULT 0,
    total_emissions DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_user_id ON footprints(user_id);
