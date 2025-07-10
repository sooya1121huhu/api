# 향수 추천 시스템 API 문서

## 개요
향수 추천 시스템의 API 문서입니다. 향수, 브랜드, 사용자 관리 기능을 제공합니다.

## API 엔드포인트

### 1. 브랜드 관리 API

#### 1.1 브랜드 목록 조회 (활성 상태만)
**URL:** `GET /api/brands`

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Chanel"
    },
    {
      "id": 2,
      "name": "Dior"
    }
  ]
}
```

#### 1.2 모든 브랜드 목록 조회 (관리자용)
**URL:** `GET /api/brands/all`

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Chanel",
      "status": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 1.3 브랜드 상세 조회
**URL:** `GET /api/brands/:id`

#### 1.4 브랜드 생성
**URL:** `POST /api/brands`

**요청 본문:**
```json
{
  "name": "새로운 브랜드"
}
```

#### 1.5 브랜드 수정
**URL:** `PUT /api/brands/:id`

**요청 본문:**
```json
{
  "name": "수정된 브랜드명"
}
```

#### 1.6 브랜드 상태 변경
**URL:** `PATCH /api/brands/:id/status`

**요청 본문:**
```json
{
  "status": 1
}
```

#### 1.7 브랜드 삭제
**URL:** `DELETE /api/brands/:id`

### 2. 향수 관리 API

#### 2.1 향수 목록 조회
**URL:** `GET /api/perfumes`

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "brand_id": 1,
      "name": "Chanel N°5",
      "url": "https://example.com/perfume/1",
      "notes": ["알데하이드", "이리스", "베티버", "바닐라", "파츌리"],
      "season_tags": ["봄", "가을", "겨울"],
      "weather_tags": ["맑음", "흐림", "비"],
      "analysis_reason": "클래식한 알데하이드 향으로 세련되고 우아한 느낌을 줍니다.",
      "status": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "PerfumeBrand": {
        "id": 1,
        "name": "Chanel"
      }
    }
  ]
}
```

#### 2.2 향수 상세 조회
**URL:** `GET /api/perfumes/:id`

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "brand_id": 1,
    "name": "Chanel N°5",
    "url": "https://example.com/perfume/1",
    "notes": ["알데하이드", "이리스", "베티버", "바닐라", "파츌리"],
    "season_tags": ["봄", "가을", "겨울"],
    "weather_tags": ["맑음", "흐림", "비"],
    "analysis_reason": "클래식한 알데하이드 향으로 세련되고 우아한 느낌을 줍니다.",
    "status": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "PerfumeBrand": {
      "id": 1,
      "name": "Chanel",
      "status": 1
    }
  }
}
```

#### 2.3 향수 등록
**URL:** `POST /api/perfumes`

**요청 본문:**
```json
{
  "brand_id": 1,
  "name": "새로운 향수",
  "url": "https://example.com/perfume",
  "notes": ["로즈", "재스민", "바닐라"],
  "season_tags": ["봄", "여름"],
  "weather_tags": ["맑음", "흐림"],
  "analysis_reason": "로맨틱하고 여성스러운 향입니다."
}
```

#### 2.4 향수 수정
**URL:** `PUT /api/perfumes/:id`

#### 2.5 향수 삭제
**URL:** `DELETE /api/perfumes/:id`

#### 2.6 유사 향수 추천
**URL:** `GET /api/perfumes/:id/similar`

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "target_perfume": {
      "id": 1,
      "brand_id": 1,
      "name": "Chanel N°5",
      "notes": ["알데하이드", "이리스", "베티버", "바닐라", "파츌리"],
      "PerfumeBrand": {
        "id": 1,
        "name": "Chanel"
      }
    },
    "similar_perfumes": [
      {
        "id": 2,
        "brand_id": 2,
        "name": "Miss Dior",
        "notes": ["로즈", "재스민", "바닐라", "머스크"],
        "common_notes": ["바닐라"],
        "common_notes_count": 1,
        "PerfumeBrand": {
          "id": 2,
          "name": "Dior"
        }
      }
    ],
    "total_similar_count": 5,
    "returned_count": 1
  }
}
```

#### 추천 알고리즘
- **노트 유사성 매핑 시스템**: 베르가못/버가못, 로즈/장미, 머스크/화이트 머스크 등 유사한 노트들을 그룹화
- **노트 기반 유사도 분석**: 2개 이상의 공통 노트(유사 노트 포함)가 있는 향수 추천
- **유사도 점수 계산**: 공통 노트 개수 기반 순위 결정
- **상위 10개 추천**: 가장 유사한 향수 10개 반환

#### 노트 유사성 예시
- **시트러스 계열**: 베르가못 ↔ 버가못, 레몬 ↔ lemon
- **플로럴 계열**: 로즈 ↔ 장미, 재스민 ↔ jasmine
- **우디 계열**: 샌달우드 ↔ sandalwood, 파츌리 ↔ patchouli
- **머스크 계열**: 머스크 ↔ 화이트 머스크 ↔ white musk
- **무화과 계열**: 무화과 ↔ 무화과 잎 ↔ fig

### 3. 사용자 관리 API

#### 3.1 사용자 목록 조회
**URL:** `GET /api/users`

#### 3.2 사용자 상세 조회
**URL:** `GET /api/users/:id`

#### 3.3 사용자 등록
**URL:** `POST /api/users`

#### 3.4 사용자 수정
**URL:** `PUT /api/users/:id`

#### 3.5 사용자 삭제
**URL:** `DELETE /api/users/:id`

### 4. 사용자-향수 관계 API

#### 4.1 사용자별 향수 목록 조회
**URL:** `GET /api/user-perfumes`

#### 4.2 사용자 향수 추가
**URL:** `POST /api/user-perfumes`

#### 4.3 사용자 향수 삭제
**URL:** `DELETE /api/user-perfumes/:id`

### 5. 추천 시스템 API

#### 5.1 향수 추천
**URL:** `GET /api/recommendations`

## 데이터베이스 스키마

### perfumes_brand 테이블
```sql
CREATE TABLE perfumes_brand (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    status TINYINT NOT NULL DEFAULT 0 COMMENT '0: 삭제, 1: 사용중',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### perfumes 테이블 (업데이트됨)
```sql
CREATE TABLE perfumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    url VARCHAR(500) NULL,
    notes JSON NOT NULL,
    season_tags JSON NOT NULL,
    weather_tags JSON NOT NULL,
    analysis_reason TEXT NOT NULL,
    status INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES perfumes_brand(id) ON DELETE RESTRICT
);
```

## 마이그레이션 가이드

### 기존 데이터베이스에서 브랜드 테이블 분리
1. `database/update_schema.sql` 스크립트 실행
2. 기존 브랜드 데이터를 `perfumes_brand` 테이블로 마이그레이션
3. `perfumes` 테이블의 `brand` 컬럼을 `brand_id`로 변경
4. 외래키 제약조건 추가

## 프론트엔드 구현 가이드

### 1. 브랜드 관리 페이지
```
브랜드 관리 페이지
├── 브랜드 목록 테이블
│   ├── 브랜드명
│   ├── 상태 (활성/비활성 스위치)
│   ├── 등록일
│   └── 작업 버튼 (수정/삭제)
├── 브랜드 등록 버튼
└── 브랜드 등록/수정 모달
    ├── 브랜드명 입력
    └── 상태 설정 (수정 시)
```

### 2. 향수 관리 페이지 (업데이트됨)
```
향수 관리 페이지
├── 향수 목록 테이블
│   ├── 브랜드 (브랜드명으로 표시)
│   ├── 향수명
│   ├── 주요 노트
│   ├── 계절 태그
│   ├── 날씨 태그
│   ├── 상태
│   └── 작업 버튼
├── 향수 등록 버튼
└── 향수 등록/수정 모달
    ├── 브랜드 선택 (드롭다운)
    ├── 향수명 입력
    ├── 주요 노트 입력
    ├── 계절 태그 선택
    ├── 날씨 태그 선택
    └── 분석 이유 입력
```

### 3. API 호출 순서
1. `GET /api/brands` - 브랜드 목록 조회
2. `GET /api/perfumes` - 향수 목록 조회 (브랜드 정보 포함)
3. 향수 등록/수정 시 브랜드 ID 사용

## 에러 처리

### 400 에러
- 필수 필드 누락
- 유효하지 않은 브랜드 ID
- 중복 브랜드명/향수명

### 404 에러
- 향수/브랜드/사용자를 찾을 수 없는 경우

### 500 에러
- 서버 내부 오류

## 테스트 방법

1. 서버 실행: `npm start`
2. 데이터베이스 마이그레이션: `mysql -u root -p < database/update_schema.sql`
3. 테스트 데이터 삽입: `mysql -u root -p < database/test_data.sql`
4. API 테스트:
   - 브랜드 API: `GET http://localhost:8080/api/brands`
   - 향수 API: `GET http://localhost:8080/api/perfumes` 