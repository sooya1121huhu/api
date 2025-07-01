const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'API 서버가 정상적으로 실행 중입니다!',
    timestamp: new Date().toISOString()
  });
});

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 에러 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: '요청한 엔드포인트를 찾을 수 없습니다.'
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다.'
  });
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT}`);
}); 