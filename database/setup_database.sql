-- =====================================================
-- 향수 추천 시스템 데이터베이스 전체 설정
-- =====================================================

-- 1. 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS perfume_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE perfume_db;

-- 2. 테이블 생성
-- =====================================================
-- 사용자 테이블 (users)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 향수 테이블 (perfumes)
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
-- 사용자-향수 관계 테이블 (user_perfumes)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_perfumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    perfume_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (perfume_id) REFERENCES perfumes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_perfume (user_id, perfume_id),
    INDEX idx_user_id (user_id),
    INDEX idx_perfume_id (perfume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 테스트 데이터 삽입
-- =====================================================
-- 테스트 사용자 데이터
-- =====================================================
INSERT IGNORE INTO users (username, password) VALUES
('testuser1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password: password
('testuser2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password: password
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),     -- password: password
('user123', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');   -- password: password

-- =====================================================
-- 테스트 향수 데이터
-- =====================================================
INSERT IGNORE INTO perfumes (brand, name, url, notes, season_tags, weather_tags, analysis_reason, status) VALUES
-- 여성향 향수들
('Chanel', 'Chanel N°5', 'https://www.chanel.com/fr/parfums/p/chanel-n5-parfum/', 
 '["알데하이드", "이리스", "베티버", "바닐라", "파츌리"]',
 '["봄", "가을", "겨울"]',
 '["맑음", "흐림", "비"]',
 '클래식한 알데하이드 향으로 세련되고 우아한 느낌을 줍니다. 봄과 가을에 특히 잘 어울리며, 정장이나 특별한 자리에 적합합니다.',
 1),

('Dior', 'Miss Dior', 'https://www.dior.com/fr_fr/parfums/femme/miss-dior',
 '["로즈", "재스민", "바닐라", "머스크"]',
 '["봄", "여름"]',
 '["맑음", "흐림"]',
 '로맨틱하고 여성스러운 향으로 봄과 여름에 완벽합니다. 데이트나 로맨틱한 자리에 추천합니다.',
 1),

('Jo Malone', 'Wood Sage & Sea Salt', 'https://www.jomalone.co.kr/wood-sage-sea-salt-cologne',
 '["우드 세이지", "해염", "앰브록스"]',
 '["봄", "여름", "가을"]',
 '["맑음", "흐림"]',
 '자연스럽고 상쾌한 향으로 일상생활에 적합합니다. 특히 여름에 시원한 느낌을 줍니다.',
 1),

-- 남성향 향수들
('Tom Ford', 'Tobacco Vanille', 'https://www.tomford.com/tobacco-vanille',
 '["바닐라", "타바코", "토닉", "코코아"]',
 '["가을", "겨울"]',
 '["흐림", "비", "눈"]',
 '따뜻하고 매력적인 향으로 가을과 겨울에 완벽합니다. 비즈니스 미팅이나 특별한 저녁 자리에 적합합니다.',
 1),

('Bleu de Chanel', 'Bleu de Chanel EDP', 'https://www.chanel.com/fr/parfums/p/bleu-de-chanel-parfum/',
 '["시트러스", "우드", "머스크", "앰버"]',
 '["봄", "여름", "가을"]',
 '["맑음", "흐림"]',
 '세련되고 남성적인 향으로 모든 계절에 어울립니다. 비즈니스나 캐주얼한 자리 모두에 적합합니다.',
 1),

('Acqua di Gio', 'Acqua di Gio Profumo', 'https://www.giorgioarmanibeauty.com/acqua-di-gio-profumo',
 '["해양 노트", "버가못", "로즈마리", "머스크"]',
 '["봄", "여름"]',
 '["맑음", "흐림"]',
 '상쾌하고 시원한 향으로 봄과 여름에 완벽합니다. 운동이나 캐주얼한 활동에 적합합니다.',
 1),

-- 유니섹스 향수들
('Le Labo', 'Santal 33', 'https://www.lelabofragrances.com/santal-33',
 '["샌달우드", "카다멈", "바이올렛", "머스크"]',
 '["가을", "겨울"]',
 '["흐림", "비"]',
 '독특하고 미니멀한 향으로 가을과 겨울에 어울립니다. 아트 갤러리나 창작 활동에 적합합니다.',
 1),

('Byredo', 'Gypsy Water', 'https://www.byredo.com/gypsy-water',
 '["베르가못", "레몬", "파인", "바닐라", "샌달우드"]',
 '["봄", "여름", "가을"]',
 '["맑음", "흐림"]',
 '자유롭고 모험적인 향으로 여행이나 새로운 경험을 할 때 적합합니다.',
 1),

('Maison Margiela', 'Jazz Club', 'https://www.maisonmargiela-fragrances.com/jazz-club',
 '["럼", "시가", "바닐라", "레더"]',
 '["가을", "겨울"]',
 '["흐림", "비"]',
 '재즈 클럽의 분위기를 연상시키는 향으로 가을과 겨울 밤에 완벽합니다.',
 1),

('Diptyque', 'Philosykos', 'https://www.diptyque-paris.com/en/philosykos',
 '["무화과", "코코넛", "우드"]',
 '["봄", "여름"]',
 '["맑음", "흐림"]',
 '자연스럽고 신선한 향으로 봄과 여름에 완벽합니다. 자연 속에서의 활동에 적합합니다.',
 1);

-- =====================================================
-- 테스트 사용자-향수 관계 데이터
-- =====================================================
INSERT IGNORE INTO user_perfumes (user_id, perfume_id) VALUES
-- testuser1이 좋아하는 향수들
(1, 1), -- Chanel N°5
(1, 3), -- Wood Sage & Sea Salt
(1, 7), -- Santal 33

-- testuser2가 좋아하는 향수들
(2, 2), -- Miss Dior
(2, 4), -- Tobacco Vanille
(2, 8), -- Gypsy Water

-- admin이 좋아하는 향수들
(3, 5), -- Bleu de Chanel
(3, 9), -- Jazz Club
(3, 10), -- Philosykos

-- user123이 좋아하는 향수들
(4, 1), -- Chanel N°5
(4, 6), -- Acqua di Gio
(4, 7); -- Santal 33

-- 4. 설정 완료 확인
SELECT '=== 데이터베이스 설정 완료 ===' as status;

SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Perfumes' as table_name, COUNT(*) as count FROM perfumes
UNION ALL
SELECT 'User_Perfumes' as table_name, COUNT(*) as count FROM user_perfumes;

SELECT '=== 테이블 구조 확인 ===' as status;
SHOW TABLES; 