-- =====================================================
-- 데이터베이스 스키마 업데이트 스크립트
-- =====================================================

USE perfume_db;

-- users 테이블에 email과 status 필드 추가
ALTER TABLE users 
ADD COLUMN email VARCHAR(100) NULL AFTER username,
ADD COLUMN status TINYINT NOT NULL DEFAULT 1 COMMENT '0: 삭제, 1: 활성' AFTER password,
ADD INDEX idx_email (email),
ADD INDEX idx_status (status);

-- user_perfumes 테이블에 status 필드 추가
ALTER TABLE user_perfumes 
ADD COLUMN status TINYINT NOT NULL DEFAULT 1 COMMENT '0: 삭제, 1: 사용 중, 2: 사용 완료' AFTER perfume_id,
ADD INDEX idx_status (status);

-- 테이블 구조 확인
DESCRIBE users;
DESCRIBE user_perfumes; 