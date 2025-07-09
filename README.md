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

### 2. 통합 기동 (모든 서비스 한번에)
```bash
npm start
# 또는
npm run dev
```

### 3. 개별 서비스 기동
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

- `GET /` - 서버 상태 확인
- `GET /api/health` - 헬스 체크
- `GET /api/users` - 사용자 관리
- `GET /api/perfumes` - 향수 정보
- `GET /api/recommendations` - 추천 시스템
- `GET /api/user-perfumes` - 사용자 향수 관리 