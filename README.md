# API 서버

이 프로젝트는 API 서버입니다.

## 설치

```bash
npm install
```

## 개발 서버 실행

```bash
npm run dev
```

## 프로덕션 서버 실행

```bash
npm start
```

## 테스트 실행

```bash
npm test
```

## 환경 변수

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```
PORT=3000
NODE_ENV=development
```

## API 엔드포인트

- `GET /` - 서버 상태 확인
- `GET /api/health` - 헬스 체크 