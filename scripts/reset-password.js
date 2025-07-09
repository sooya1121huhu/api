const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');

async function resetUserPassword(userId, newPassword) {
  try {
    // 데이터베이스 연결 확인
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공');
    
    // 새 비밀번호 해시화
    const hash = await bcrypt.hash(newPassword, 10);
    
    // 사용자 비밀번호 업데이트
    const [updatedRows] = await sequelize.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      {
        replacements: [hash, userId],
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    if (updatedRows > 0) {
      console.log(`사용자 ID ${userId}의 비밀번호가 성공적으로 변경되었습니다.`);
      console.log(`새 비밀번호: ${newPassword}`);
    } else {
      console.log(`사용자 ID ${userId}를 찾을 수 없습니다.`);
    }
    
  } catch (error) {
    console.error('비밀번호 변경 중 오류 발생:', error);
  } finally {
    // 데이터베이스 연결 종료
    await sequelize.close();
  }
}

// 사용 예시
// node scripts/reset-password.js <userId> <newPassword>
const userId = process.argv[2];
const newPassword = process.argv[3];

if (!userId || !newPassword) {
  console.log('사용법: node scripts/reset-password.js <userId> <newPassword>');
  console.log('예시: node scripts/reset-password.js 1 mynewpassword123');
  process.exit(1);
}

resetUserPassword(userId, newPassword); 