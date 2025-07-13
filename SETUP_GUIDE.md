# 향수 추천 시스템 설정 가이드

## 📋 필수 환경변수 설정

### 1. API 서버 환경변수 설정

`api/.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# 서버 설정
PORT=8080
NODE_ENV=development

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_NAME=perfume_db
DB_USER=root
DB_PASSWORD=your_password_here

# API 설정
API_BASE_URL=http://localhost:8080

# CORS 설정
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# 보안 설정
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
BCRYPT_ROUNDS=10

# 로깅 설정
LOG_LEVEL=info
```

### 2. 프론트엔드 환경변수 설정

`frontend/.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
REACT_APP_API_URL=http://localhost:8080
```

### 3. 어드민 환경변수 설정

`perfume-admin/.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
REACT_APP_API_URL=http://localhost:8080
```

## 🚀 프로젝트 실행 순서

### 1. 데이터베이스 설정
```bash
# MySQL 데이터베이스 생성
mysql -u root -p
CREATE DATABASE perfume_db;
```

### 2. API 서버 실행
```bash
cd api
npm install
npm start
```

### 3. 프론트엔드 실행
```bash
cd frontend
npm install
npm start
```

### 4. 어드민 실행
```bash
cd perfume-admin
npm install
npm start
```

## 🌐 접근 URL

- **API 서버**: http://localhost:8080
- **프론트엔드**: http://localhost:5173
- **어드민**: http://localhost:5174

## ⚠️ 주의사항

1. **데이터베이스 연결**: MySQL이 실행 중이어야 합니다.
2. **포트 충돌**: 각 서비스가 다른 포트를 사용하므로 포트 충돌이 없어야 합니다.
3. **환경변수**: `.env` 파일이 각 프로젝트 루트에 있어야 합니다.
4. **CORS 설정**: API 서버의 CORS 설정이 프론트엔드와 어드민의 URL을 허용해야 합니다.

## 🔧 문제 해결

### 데이터베이스 연결 오류
- MySQL 서비스가 실행 중인지 확인
- 데이터베이스 이름, 사용자명, 비밀번호가 올바른지 확인
- 포트 3306이 사용 가능한지 확인

### CORS 오류
- API 서버의 CORS 설정에서 프론트엔드와 어드민 URL이 허용되어 있는지 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인

### 포트 충돌
- 각 서비스가 지정된 포트를 사용하는지 확인
- 다른 프로세스가 해당 포트를 사용하고 있다면 종료 