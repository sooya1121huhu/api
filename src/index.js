const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// 데이터베이스 및 모델 import
const { sequelize, syncDatabase } = require('./config/database');
const { User, Perfume, UserPerfume } = require('./models');
const usersRouter = require('./routes/users');
const perfumesRouter = require('./routes/perfumes');
const recommendationsRouter = require('./routes/recommendations');
const userPerfumesRouter = require('./routes/userPerfumes');

const app = express();
const PORT = process.env.PORT || 8080;

// CORS 설정
const corsOptions = {
  origin: [
    'http://localhost:5173',  // Frontend 개발 서버
    'http://localhost:5174',  // Admin 개발 서버
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://0.0.0.0:5173',
    'http://0.0.0.0:5174',
    'http://perfume-ys-frontend.s3-website.ap-northeast-2.amazonaws.com', // S3 정적 웹 호스팅
    'http://perfume-ys-frontend.s3-website.ap-northeast-2.amazonaws.com/frontend', // 프론트엔드
    'http://perfume-ys-frontend.s3-website.ap-northeast-2.amazonaws.com/admin' // 어드민
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// 미들웨어
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 데이터베이스 연결 및 테이블 동기화
syncDatabase();

// 모델 관계 설정
// User.hasMany(UserPerfume, { foreignKey: 'user_id' });
// UserPerfume.belongsTo(User, { foreignKey: 'user_id' });
// Perfume.hasMany(UserPerfume, { foreignKey: 'perfume_id' });
// UserPerfume.belongsTo(Perfume, { foreignKey: 'perfume_id' });

// 라우터 설정
app.use('/api/users', usersRouter);
app.use('/api/perfumes', perfumesRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/user-perfumes', userPerfumesRouter);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '향수 추천 API 서버가 정상적으로 실행 중입니다!',
    timestamp: new Date().toISOString(),
    database: 'MySQL 연결됨',
    endpoints: {
      users: '/api/users',
      perfumes: '/api/perfumes',
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
      database: 'Connected',
      services: {
        mysql: 'Connected'
      }
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  // console.log(`http://localhost:${PORT}`);
  // console.log(`http://0.0.0.0:${PORT} (네트워크 접근 가능)`);
  console.log('📊 MySQL 데이터베이스 연동 완료!');
  console.log('🤖 향수 추천 시스템 준비 완료!');
}); 