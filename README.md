# 향수 추천 시스템

이 프로젝트는 향수 추천 시스템의 전체 스택입니다.

## 🏗️ 프로젝트 구조

- **API 서버** (`/api`) - Node.js + Express + MySQL (포트 8080)
- **프론트엔드** (`/frontend`) - React + Material-UI (포트 5173)  
- 어드민 페이지는 별도 perfume-admin 레포지토리로 분리되어 관리됩니다.

## 🚀 빠른 시작

### 1. 모든 의존성 설치
```bash
npm run install:all
```

### 2. 데이터베이스 설정
```bash
# 데이터베이스 생성 및 테이블 생성
mysql -u root -p < database/schema.sql

# 기존 데이터베이스에서 브랜드 테이블 분리 (기존 데이터가 있는 경우)
mysql -u root -p < database/update_schema.sql

# 테스트 데이터 삽입
mysql -u root -p < database/test_data.sql
```

### 3. 통합 기동 (모든 서비스 한번에)
```bash
npm start
# 또는
npm run dev
```

### 4. 개별 서비스 기동
```bash
# API 서버만
npm run start:api

# 프론트엔드만  
npm run start:frontend

# 어드민 페이지만
npm run start:admin
```

## 🌐 외부 접근 설정

### ngrok을 사용한 외부 접근

#### 1. ngrok 설치
```bash
# macOS
brew install ngrok

# 또는 공식 사이트에서 다운로드
# https://ngrok.com/download
```

#### 2. ngrok 계정 설정
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

#### 3. 각 서비스 터널링
```bash
# API 서버 터널링 (포트 8080)
ngrok http 8080

# 프론트엔드 터널링 (포트 5173)  
ngrok http 5173

# 어드민 페이지 터널링 (포트 5174)
ngrok http 5174
```

#### 4. 동시 터널링 (여러 터미널 사용)
```bash
# 터미널 1: API 서버
ngrok http 8080

# 터미널 2: 프론트엔드
ngrok http 5173

# 터미널 3: 어드민 페이지  
ngrok http 5174
```

### 로컬 네트워크 접근

각 서비스는 이미 `0.0.0.0`으로 설정되어 있어 로컬 네트워크에서 접근 가능합니다:

- **API 서버**: `http://YOUR_LOCAL_IP:8080`
- **프론트엔드**: `http://YOUR_LOCAL_IP:5173`
- **어드민 페이지**: `http://YOUR_LOCAL_IP:5174`

## 📱 접근 URL

### 로컬 접근
- **API 서버**: http://localhost:8080
- **프론트엔드**: http://localhost:5173
- **어드민 페이지**: http://localhost:5174

### 외부 접근 (ngrok 사용 시)
ngrok 실행 후 제공되는 URL 사용:
- 예: `https://abc123.ngrok.io`

## 🔧 환경 변수

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```
PORT=8080
NODE_ENV=development
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

## 📊 API 엔드포인트

### 기본 엔드포인트
- `GET /` - 서버 상태 확인
- `GET /api/health` - 헬스 체크

### 사용자 관리
- `GET /api/users` - 사용자 목록 조회
- `POST /api/users` - 사용자 등록
- `PUT /api/users/:id` - 사용자 수정
- `DELETE /api/users/:id` - 사용자 삭제

### 브랜드 관리 (신규)
- `GET /api/brands` - 활성 브랜드 목록 조회
- `GET /api/brands/all` - 모든 브랜드 목록 조회 (관리자용)
- `POST /api/brands` - 브랜드 등록
- `PUT /api/brands/:id` - 브랜드 수정
- `PATCH /api/brands/:id/status` - 브랜드 상태 변경
- `DELETE /api/brands/:id` - 브랜드 삭제

### 향수 관리 (업데이트됨)
- `GET /api/perfumes` - 향수 목록 조회 (브랜드 정보 포함)
- `POST /api/perfumes` - 향수 등록 (brand_id 사용)
- `PUT /api/perfumes/:id` - 향수 수정
- `DELETE /api/perfumes/:id` - 향수 삭제
- `GET /api/perfumes/:id/similar` - 유사 향수 추천

### 사용자-향수 관계
- `GET /api/user-perfumes` - 사용자별 향수 목록 조회
- `POST /api/user-perfumes` - 사용자 향수 추가
- `DELETE /api/user-perfumes/:id` - 사용자 향수 삭제

### 추천 시스템
- `GET /api/recommendations` - 향수 추천

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- **users** - 사용자 정보
- **perfumes_brand** - 브랜드 정보 (신규)
- **perfumes** - 향수 정보 (brand_id로 브랜드 연결)
- **user_perfumes** - 사용자-향수 관계

### 브랜드 테이블 분리
기존 `perfumes` 테이블의 `brand` 컬럼을 별도 `perfumes_brand` 테이블로 분리하여 관리합니다.

## 🔄 마이그레이션 가이드

### 기존 데이터베이스에서 브랜드 테이블 분리
1. `database/update_schema.sql` 스크립트 실행
2. 기존 브랜드 데이터를 `perfumes_brand` 테이블로 마이그레이션
3. `perfumes` 테이블의 `brand` 컬럼을 `brand_id`로 변경
4. 외래키 제약조건 추가

### 마이그레이션 스크립트 실행
```bash
# 기존 데이터베이스가 있는 경우
mysql -u root -p < database/update_schema.sql

# 새로운 데이터베이스 생성
mysql -u root -p < database/schema.sql

# 테스트 데이터 삽입
mysql -u root -p < database/test_data.sql
```

## 🎯 주요 기능

### 브랜드 관리 (신규)
- 브랜드 등록/수정/삭제
- 브랜드 상태 관리 (활성/비활성)
- 향수와 브랜드 연결 관리

### 향수 관리 (업데이트됨)
- 브랜드 선택 드롭다운으로 변경
- 브랜드 정보와 함께 표시
- 유사 향수 추천 기능

### 사용자 관리
- 사용자 등록/수정/삭제
- 사용자별 향수 관리

### 추천 시스템
- 노트 기반 유사 향수 추천
- 계절/날씨 태그 기반 추천

## 📚 API 문서

자세한 API 문서는 `API_DOCS.md` 파일을 참조하세요.

## 🧪 테스트

```bash
# API 서버 테스트
curl http://localhost:8080/api/health

# 브랜드 API 테스트
curl http://localhost:8080/api/brands

# 향수 API 테스트
curl http://localhost:8080/api/perfumes
``` 