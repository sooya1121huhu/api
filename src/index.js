const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// 데이터베이스 및 모델 import
const { sequelize, testConnection } = require('./config/database');
const User = require('./models/User');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 데이터베이스 연결 테스트
testConnection();

// 데이터베이스 동기화 (개발 환경에서만 사용)
sequelize.sync({ force: false }).then(() => {
  console.log('✅ 데이터베이스 테이블이 동기화되었습니다.');
}).catch((error) => {
  console.error('❌ 데이터베이스 동기화 실패:', error);
});

// 라우터 설정
app.use('/api/users', usersRouter);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'API 서버가 정상적으로 실행 중입니다!',
    timestamp: new Date().toISOString(),
    database: 'MySQL 연결됨',
    endpoints: {
      users: '/api/users',
      health: '/api/health'
    }
  });
});

// 헬스 체크 엔드포인트
app.get('/api/health', async (req, res) => {
  try {
    // 데이터베이스 연결 상태 확인
    await sequelize.authenticate();
    
    res.json({
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message
    });
  }
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
  console.log('📊 MySQL 데이터베이스 연동 완료!');
}); 