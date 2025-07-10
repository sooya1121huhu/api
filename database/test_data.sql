-- =====================================================
-- 향수 추천 시스템 테스트 데이터
-- =====================================================

USE perfume_db;

-- =====================================================
-- 1. 테스트 사용자 데이터 삽입
-- =====================================================
INSERT INTO users (username, password) VALUES
('testuser1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password: password
('testuser2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password: password
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),     -- password: password
('user123', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');   -- password: password

-- =====================================================
-- 2. 브랜드 데이터 삽입
-- =====================================================
INSERT INTO perfumes_brand (name, status) VALUES
('Chanel', 1),
('Dior', 1),
('Jo Malone', 1),
('Tom Ford', 1),
('Bleu de Chanel', 1),
('Acqua di Gio', 1),
('Le Labo', 1),
('Byredo', 1),
('Maison Margiela', 1),
('Diptyque', 1);

-- =====================================================
-- 3. 테스트 향수 데이터 삽입
-- =====================================================
INSERT INTO perfumes (brand_id, name, notes, season_tags, weather_tags, analysis_reason, status) VALUES
-- 여성향 향수들
(1, 'Chanel N°5', 
 '["알데하이드", "이리스", "베티버", "바닐라", "파츌리"]',
 '["봄", "가을", "겨울"]',
 '["맑음", "흐림", "비"]',
 '클래식한 알데하이드 향으로 세련되고 우아한 느낌을 줍니다. 봄과 가을에 특히 잘 어울리며, 정장이나 특별한 자리에 적합합니다.',
 1),

(2, 'Miss Dior',
 '["로즈", "재스민", "바닐라", "머스크"]',
 '["봄", "여름"]',
 '["맑음", "흐림"]',
 '로맨틱하고 여성스러운 향으로 봄과 여름에 완벽합니다. 데이트나 로맨틱한 자리에 추천합니다.',
 1),

(3, 'Wood Sage & Sea Salt',
 '["우드 세이지", "해염", "앰브록스"]',
 '["봄", "여름", "가을"]',
 '["맑음", "흐림"]',
 '자연스럽고 상쾌한 향으로 일상생활에 적합합니다. 특히 여름에 시원한 느낌을 줍니다.',
 1),

-- 남성향 향수들
(4, 'Tobacco Vanille',
 '["바닐라", "타바코", "토닉", "코코아"]',
 '["가을", "겨울"]',
 '["흐림", "비", "눈"]',
 '따뜻하고 매력적인 향으로 가을과 겨울에 완벽합니다. 비즈니스 미팅이나 특별한 저녁 자리에 적합합니다.',
 1),

(5, 'Bleu de Chanel EDP',
 '["시트러스", "우드", "머스크", "앰버"]',
 '["봄", "여름", "가을"]',
 '["맑음", "흐림"]',
 '세련되고 남성적인 향으로 모든 계절에 어울립니다. 비즈니스나 캐주얼한 자리 모두에 적합합니다.',
 1),

(6, 'Acqua di Gio Profumo',
 '["해양 노트", "버가못", "로즈마리", "머스크"]',
 '["봄", "여름"]',
 '["맑음", "흐림"]',
 '상쾌하고 시원한 향으로 봄과 여름에 완벽합니다. 운동이나 캐주얼한 활동에 적합합니다.',
 1),

-- 유니섹스 향수들
(7, 'Santal 33',
 '["샌달우드", "카다멈", "바이올렛", "머스크"]',
 '["가을", "겨울"]',
 '["흐림", "비"]',
 '독특하고 미니멀한 향으로 가을과 겨울에 어울립니다. 아트 갤러리나 창작 활동에 적합합니다.',
 1),

(8, 'Gypsy Water',
 '["베르가못", "레몬", "파인", "바닐라", "샌달우드"]',
 '["봄", "여름", "가을"]',
 '["맑음", "흐림"]',
 '자유롭고 모험적인 향으로 여행이나 새로운 경험을 할 때 적합합니다.',
 1),

(9, 'Jazz Club',
 '["럼", "시가", "바닐라", "레더"]',
 '["가을", "겨울"]',
 '["흐림", "비"]',
 '재즈 클럽의 분위기를 연상시키는 향으로 가을과 겨울 밤에 완벽합니다.',
 1),

(10, 'Philosykos',
 '["무화과", "코코넛", "우드"]',
 '["봄", "여름"]',
 '["맑음", "흐림"]',
 '자연스럽고 신선한 향으로 봄과 여름에 완벽합니다. 자연 속에서의 활동에 적합합니다.',
 1);

-- =====================================================
-- 4. 테스트 사용자-향수 관계 데이터 삽입
-- =====================================================
INSERT INTO user_perfumes (user_id, perfume_id) VALUES
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

-- =====================================================
-- 데이터 삽입 확인
-- =====================================================
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Perfumes Brand' as table_name, COUNT(*) as count FROM perfumes_brand
UNION ALL
SELECT 'Perfumes' as table_name, COUNT(*) as count FROM perfumes
UNION ALL
SELECT 'User_Perfumes' as table_name, COUNT(*) as count FROM user_perfumes;

-- 사용자별 좋아하는 향수 확인
SELECT 
    u.username,
    pb.name as brand_name,
    p.name as perfume_name,
    up.created_at as liked_at
FROM users u
JOIN user_perfumes up ON u.id = up.user_id
JOIN perfumes p ON up.perfume_id = p.id
JOIN perfumes_brand pb ON p.brand_id = pb.id
ORDER BY u.username, pb.name;

-- 브랜드별 향수 개수 확인
SELECT 
    pb.name as brand_name,
    COUNT(p.id) as perfume_count
FROM perfumes_brand pb
LEFT JOIN perfumes p ON pb.id = p.brand_id
GROUP BY pb.id, pb.name
ORDER BY perfume_count DESC; 