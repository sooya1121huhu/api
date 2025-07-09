const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');

async function updateAllPasswords(newPassword) {
  try {
    await sequelize.authenticate();
    const hash = await bcrypt.hash(newPassword, 10);
    await sequelize.query(
      'UPDATE users SET password = ?, updated_at = NOW()',
      {
        replacements: [hash],
        type: sequelize.QueryTypes.UPDATE
      }
    );
    console.log('모든 사용자의 비밀번호가 성공적으로 변경되었습니다.');
  } catch (error) {
    console.error('비밀번호 변경 중 오류:', error);
  } finally {
    await sequelize.close();
  }
}

updateAllPasswords('test1234');