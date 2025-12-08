-- db/init.sql

CREATE DATABASE IF NOT EXISTS myrun
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;

USE myrun;

-- 1) 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  height_cm INT,
  weight_kg INT,
  age INT,
  gender ENUM('male','female') DEFAULT 'male',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2) 러닝 기록 테이블 (✅ 경로 관련 필드 추가)
CREATE TABLE IF NOT EXISTS runs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  run_date DATE NOT NULL,
  distance_km DECIMAL(5,2) NOT NULL,
  duration_min INT NOT NULL,
  avg_speed_kmh DECIMAL(4,1) NOT NULL,
  calories INT NOT NULL,
  course_name VARCHAR(255),
  memo TEXT,
  start_lat DECIMAL(10,7),
  start_lng DECIMAL(10,7),
  end_lat DECIMAL(10,7),
  end_lng DECIMAL(10,7),
  path_json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_runs_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3) 코스 테이블
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  area VARCHAR(50) NOT NULL,
  distance_km DECIMAL(5,2) NOT NULL,
  level ENUM('하','중','상') NOT NULL,
  description TEXT
);

-- 🔹 샘플 유저 (username: testuser, password: 1234)
INSERT INTO users (username, password, name, height_cm, weight_kg, age, gender)
VALUES (
  'testuser',
  '$2b$10$pbjgA.x7Wz1QeCWPSJZywOP9XrROwDBDiZgQQn9RoYJD539MZlOsG', -- "1234" bcrypt 해시
  '테스트유저',
  170,
  60,
  23,
  'male'
)
ON DUPLICATE KEY UPDATE username = username;