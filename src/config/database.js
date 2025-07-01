const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './config.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'wbpj_db',
  process.env.DB_USER || 'wbpj_user',
  process.env.DB_PASSWORD || 'Wbpj2024!',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false, // 개발 시에는 true로 설정하여 SQL 쿼리 로그 확인 가능
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      // SSL 설정 (프로덕션 환경에서 사용)
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false
      // }
    }
  }
);

// 데이터베이스 연결 테스트
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL 데이터베이스 연결 성공!');
    console.log(`📊 데이터베이스: ${process.env.DB_NAME || 'wbpj_db'}`);
    console.log(`👤 사용자: ${process.env.DB_USER || 'wbpj_user'}`);
  } catch (error) {
    console.error('❌ MySQL 데이터베이스 연결 실패:', error);
  }
};

module.exports = { sequelize, testConnection }; 