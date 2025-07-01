const express = require('express');
const User = require('../models/User');
const router = express.Router();

// 모든 사용자 조회
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // 비밀번호 제외
    });
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 특정 사용자 조회
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 새 사용자 생성
router.post('/', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    // 필수 필드 검증
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '사용자명, 이메일, 비밀번호는 필수입니다.'
      });
    }
    
    // 이메일 중복 확인
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다.'
      });
    }
    
    const user = await User.create({
      username,
      email,
      password, // 실제로는 해시화해야 함
      fullName
    });
    
    // 비밀번호 제외하고 응답
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: '사용자가 성공적으로 생성되었습니다.',
      data: userResponse
    });
  } catch (error) {
    console.error('사용자 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 생성 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 사용자 정보 수정
router.put('/:id', async (req, res) => {
  try {
    const { username, email, fullName, isActive } = req.body;
    const userId = req.params.id;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 업데이트할 필드만 수정
    if (username) user.username = username;
    if (email) user.email = email;
    if (fullName !== undefined) user.fullName = fullName;
    if (isActive !== undefined) user.isActive = isActive;
    
    await user.save();
    
    // 비밀번호 제외하고 응답
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: '사용자 정보가 성공적으로 수정되었습니다.',
      data: userResponse
    });
  } catch (error) {
    console.error('사용자 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 수정 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 사용자 삭제
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    await user.destroy();
    
    res.json({
      success: true,
      message: '사용자가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('사용자 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router; 