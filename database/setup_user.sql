-- =====================================================
-- 데이터베이스 사용자 생성 및 권한 설정
-- =====================================================

-- 1. 로컬 사용자 생성 (로컬 개발용)
CREATE USER IF NOT EXISTS 'perfume_admin'@'localhost' IDENTIFIED BY 'Perfume2024!';

-- 2. 원격 사용자 생성 (RDS 연결용)
CREATE USER IF NOT EXISTS 'perfume_admin'@'%' IDENTIFIED BY 'Perfume2024!';

-- 3. 데이터베이스 권한 부여
GRANT ALL PRIVILEGES ON perfume_db.* TO 'perfume_admin'@'localhost';
GRANT ALL PRIVILEGES ON perfume_db.* TO 'perfume_admin'@'%';

-- 4. 권한 변경사항 적용
FLUSH PRIVILEGES;

-- 5. 사용자 생성 확인
SELECT User, Host FROM mysql.user WHERE User = 'perfume_admin';

-- 6. 권한 확인
SHOW GRANTS FOR 'perfume_admin'@'localhost';
SHOW GRANTS FOR 'perfume_admin'@'%'; 