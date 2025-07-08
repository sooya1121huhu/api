# 데이터베이스 설정 가이드

이 디렉토리에는 향수 추천 시스템의 데이터베이스 설정을 위한 SQL 스크립트들이 포함되어 있습니다.

## 📁 파일 구조

```
database/
├── schema.sql              # 테이블 생성 스키마
├── test_data.sql           # 테스트 데이터 삽입
├── setup_user.sql          # 데이터베이스 사용자 생성
├── setup_database.sql      # 전체 설정 통합 스크립트
└── README.md               # 이 파일
```

## 🚀 빠른 시작 (권장)

가장 간단한 방법으로 전체 데이터베이스를 설정하려면:

```bash
# MySQL에 root로 접속
mysql -u root -p

# 통합 스크립트 실행
source /path/to/api/database/setup_database.sql;
```

## 📋 단계별 설정

### 1. 데이터베이스 사용자 생성

```bash
mysql -u root -p < database/setup_user.sql
```

### 2. 테이블 생성

```bash
mysql -u root -p < database/schema.sql
```

### 3. 테스트 데이터 삽입

```bash
mysql -u root -p < database/test_data.sql
```

## 🗄️ 데이터베이스 구조

### 테이블 설명

#### 1. `users` - 사용자 테이블
- `id`: 사용자 고유 ID (자동 증가)
- `username`: 사용자명 (고유)
- `password`: 암호화된 비밀번호
- `created_at`, `updated_at`: 생성/수정 시간

#### 2. `perfumes` - 향수 테이블
- `id`: 향수 고유 ID (자동 증가)
- `brand`: 브랜드명
- `name`: 향수명
- `url`: 제품 URL
- `notes`: 향료 노트 (JSON)
- `season_tags`: 계절 태그 (JSON)
- `weather_tags`: 날씨 태그 (JSON)
- `analysis_reason`: 분석 이유
- `status`: 상태 (1: 활성, 0: 비활성)

#### 3. `user_perfumes` - 사용자-향수 관계 테이블
- `id`: 관계 고유 ID (자동 증가)
- `user_id`: 사용자 ID (외래키)
- `perfume_id`: 향수 ID (외래키)
- `created_at`, `updated_at`: 생성/수정 시간

## 🔐 테스트 계정

스크립트 실행 후 다음 테스트 계정을 사용할 수 있습니다:

| 사용자명 | 비밀번호 | 역할 |
|---------|---------|------|
| testuser1 | password | 테스트 사용자 1 |
| testuser2 | password | 테스트 사용자 2 |
| admin | password | 관리자 |
| user123 | password | 일반 사용자 |

## 🌸 포함된 테스트 향수

### 여성향
- **Chanel N°5** - 클래식한 알데하이드 향
- **Miss Dior** - 로맨틱한 로즈 향
- **Jo Malone Wood Sage & Sea Salt** - 자연스러운 우드 향

### 남성향
- **Tom Ford Tobacco Vanille** - 따뜻한 타바코 향
- **Bleu de Chanel** - 세련된 시트러스 향
- **Acqua di Gio Profumo** - 상쾌한 해양 향

### 유니섹스
- **Le Labo Santal 33** - 미니멀한 샌달우드 향
- **Byredo Gypsy Water** - 자유로운 베르가못 향
- **Maison Margiela Jazz Club** - 재즈 클럽 분위기
- **Diptyque Philosykos** - 자연스러운 무화과 향

## 🔍 데이터 확인 쿼리

### 전체 데이터 개수 확인
```sql
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Perfumes' as table_name, COUNT(*) as count FROM perfumes
UNION ALL
SELECT 'User_Perfumes' as table_name, COUNT(*) as count FROM user_perfumes;
```

### 사용자별 좋아하는 향수 확인
```sql
SELECT 
    u.username,
    p.brand,
    p.name,
    up.created_at as liked_at
FROM users u
JOIN user_perfumes up ON u.id = up.user_id
JOIN perfumes p ON up.perfume_id = p.id
ORDER BY u.username, p.brand;
```

### 브랜드별 향수 개수 확인
```sql
SELECT 
    brand,
    COUNT(*) as perfume_count
FROM perfumes
GROUP BY brand
ORDER BY perfume_count DESC;
```

## ⚠️ 주의사항

1. **MySQL 서버 실행**: 스크립트 실행 전 MySQL 서버가 실행 중인지 확인
2. **권한 확인**: root 권한으로 실행하거나 적절한 권한이 있는지 확인
3. **데이터 백업**: 기존 데이터가 있다면 백업 후 실행
4. **중복 실행**: `INSERT IGNORE`를 사용하여 중복 데이터 삽입 방지

## 🆘 문제 해결

### 접속 오류
```bash
# MySQL 서비스 상태 확인
brew services list | grep mysql

# MySQL 서비스 시작
brew services start mysql
```

### 권한 오류
```bash
# root로 접속 후 사용자 권한 확인
mysql -u root -p
SHOW GRANTS FOR 'perfume_admin'@'localhost';
```

### 데이터베이스 존재 확인
```sql
SHOW DATABASES;
USE perfume_db;
SHOW TABLES;
``` 