const express = require('express');
const { User } = require('../models');
const Perfume = require('../models/Perfume');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// 모든 사용자 조회
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      where: { status: 1 },
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: users
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
    const user = await User.findByPk(req.params.id);
    
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

// 새 사용자 등록
router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 필수 필드 검증
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '사용자명, 이메일, 비밀번호는 필수입니다.'
      });
    }
    
    // 중복 확인
    const existingUser = await User.findOne({
      where: { 
        [require('sequelize').Op.or]: [
          { username },
          { email }
        ],
        status: 1
      }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 사용자명 또는 이메일입니다.'
      });
    }
    
    // 사용자 생성
    const user = await User.create({
      username,
      email,
      password, // 실제로는 해시화해야 함
      status: 1
    });
    
    res.status(201).json({
      success: true,
      message: '사용자가 성공적으로 등록되었습니다.',
      data: user
    });
    
  } catch (error) {
    console.error('사용자 등록 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 등록 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 사용자 정보 수정
router.put('/:id', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userId = req.params.id;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 중복 확인 (자신 제외)
    if (username || email) {
      const existingUser = await User.findOne({
        where: { 
          [require('sequelize').Op.or]: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : [])
          ],
          status: 1,
          id: { [require('sequelize').Op.ne]: userId }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '이미 존재하는 사용자명 또는 이메일입니다.'
        });
      }
    }
    
    // 업데이트할 필드만 수정
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      // 비밀번호는 bcrypt로 해시화
      const hash = await bcrypt.hash(password, 10);
      user.password = hash;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: '사용자 정보가 성공적으로 수정되었습니다.',
      data: user
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

// 사용자 삭제 (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // soft delete (status = 0)
    await user.update({ status: 0 });
    
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

// 사용자 보유 향수 조회
router.get('/:id/perfumes', async (req, res) => {
  try {
    const userPerfumes = await UserPerfume.findAll({
      where: { 
        user_id: req.params.id,
        status: 1
      },
      include: [{
        model: Perfume,
        where: { status: 1 },
        required: true
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: userPerfumes.map(up => up.Perfume)
    });
  } catch (error) {
    console.error('사용자 보유 향수 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 보유 향수 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 사용자 보유 향수 추가
router.post('/:id/perfumes', async (req, res) => {
  try {
    const { perfume_id } = req.body;
    const user_id = req.params.id;
    
    if (!perfume_id) {
      return res.status(400).json({
        success: false,
        message: '향수 ID는 필수입니다.'
      });
    }
    
    // 사용자 존재 확인
    const user = await User.findByPk(user_id);
    if (!user || user.status === 0) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 향수 존재 확인
    const perfume = await Perfume.findByPk(perfume_id);
    if (!perfume || perfume.status === 0) {
      return res.status(404).json({
        success: false,
        message: '향수를 찾을 수 없습니다.'
      });
    }
    
    // 이미 보유한 향수인지 확인
    const existingUserPerfume = await UserPerfume.findOne({
      where: { user_id, perfume_id, status: 1 }
    });
    
    if (existingUserPerfume) {
      return res.status(400).json({
        success: false,
        message: '이미 보유한 향수입니다.'
      });
    }
    
    // 보유 향수 추가
    const userPerfume = await UserPerfume.create({
      user_id,
      perfume_id,
      status: 1
    });
    
    res.status(201).json({
      success: true,
      message: '향수가 성공적으로 추가되었습니다.',
      data: perfume
    });
    
  } catch (error) {
    console.error('사용자 보유 향수 추가 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 보유 향수 추가 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 사용자 보유 향수 삭제
router.delete('/:id/perfumes/:perfume_id', async (req, res) => {
  try {
    const { id: user_id, perfume_id } = req.params;
    
    const userPerfume = await UserPerfume.findOne({
      where: { user_id, perfume_id, status: 1 }
    });
    
    if (!userPerfume) {
      return res.status(404).json({
        success: false,
        message: '보유한 향수를 찾을 수 없습니다.'
      });
    }
    
    // soft delete (status = 0)
    await userPerfume.update({ status: 0 });
    
    res.json({
      success: true,
      message: '향수가 성공적으로 제거되었습니다.'
    });
    
  } catch (error) {
    console.error('사용자 보유 향수 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 보유 향수 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '아이디와 비밀번호를 입력하세요.' });
    }
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ success: false, message: '이미 존재하는 아이디입니다.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hash });
    res.json({ success: true, message: '회원가입 성공', user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(500).json({ success: false, message: '회원가입 오류', error: err.message });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '아이디와 비밀번호를 입력하세요.' });
    }
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ success: false, message: '존재하지 않는 아이디입니다.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, message: '로그인 성공', token });
  } catch (err) {
    res.status(500).json({ success: false, message: '로그인 오류', error: err.message });
  }
});

// 비밀번호 변경
router.put('/:id/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.'
      });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 현재 비밀번호 확인
    const validCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validCurrentPassword) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호가 일치하지 않습니다.'
      });
    }
    
    // 새 비밀번호 해시화
    const hash = await bcrypt.hash(newPassword, 10);
    
    // 비밀번호 업데이트
    await user.update({ password: hash });
    
    res.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });
    
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    res.status(500).json({
      success: false,
      message: '비밀번호 변경 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 관리자용 비밀번호 리셋 (현재 비밀번호 확인 없이)
router.put('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.params.id;
    
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: '새 비밀번호를 입력해주세요.'
      });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 새 비밀번호 해시화
    const hash = await bcrypt.hash(newPassword, 10);
    
    // 비밀번호 업데이트
    await user.update({ password: hash });
    
    res.json({
      success: true,
      message: '비밀번호가 성공적으로 리셋되었습니다.'
    });
    
  } catch (error) {
    console.error('비밀번호 리셋 오류:', error);
    res.status(500).json({
      success: false,
      message: '비밀번호 리셋 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router; 