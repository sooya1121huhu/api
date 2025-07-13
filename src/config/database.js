const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL 데이터베이스 연결 성공!');
    // await sequelize.sync({ force: false, alter: true }); // DB 컬럼명 자동 변경 방지
    console.log('✅ 데이터베이스 테이블이 동기화되었습니다.');
  } catch (error) {
    console.error('❌ 데이터베이스 연결 오류:', error);
    throw error; // 에러를 다시 던져서 서버 시작을 중단
  }
}

module.exports = { sequelize, syncDatabase }; 