-- =====================================================
-- 향수 추천 시스템 데이터베이스 스키마
-- =====================================================

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS perfume_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE perfume_db;

-- =====================================================
-- 1. 사용자 테이블 (users)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NULL,
    password VARCHAR(255) NOT NULL,
    status TINYINT NOT NULL DEFAULT 1 COMMENT '0: 삭제, 1: 활성',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. 향수 테이블 (perfumes)
-- =====================================================
CREATE TABLE IF NOT EXISTS perfumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    url VARCHAR(500) NULL,
    notes JSON NOT NULL,
    season_tags JSON NOT NULL,
    weather_tags JSON NOT NULL,
    analysis_reason TEXT NOT NULL,
    status INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_brand (brand),
    INDEX idx_name (name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. 사용자-향수 관계 테이블 (user_perfumes)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_perfumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    perfume_id INT NOT NULL,
    status TINYINT NOT NULL DEFAULT 1 COMMENT '0: 삭제, 1: 사용 중, 2: 사용 완료',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (perfume_id) REFERENCES perfumes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_perfume (user_id, perfume_id),
    INDEX idx_user_id (user_id),
    INDEX idx_perfume_id (perfume_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 테이블 생성 확인
-- =====================================================
SHOW TABLES;

-- 테이블 구조 확인
DESCRIBE users;
DESCRIBE perfumes;
DESCRIBE user_perfumes; 