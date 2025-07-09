const express = require('express');
const jwt = require('jsonwebtoken');
const { UserPerfume, Perfume, User } = require('../models');
const router = express.Router();
const { Sequelize } = require('sequelize'); // sequelize 모듈 수정

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// 인증 미들웨어
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: '인증 필요' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: '토큰 오류' });
  }
}

// 내 보유 향수 전체 조회
router.get('/', auth, async (req, res) => {
  try {
    const userPerfumes = await UserPerfume.findAll({
      where: { user_id: req.user.userId },
      include: [{ model: Perfume }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: userPerfumes });
  } catch (err) {
    console.error(err); // 에러 로그 추가
    res.status(500).json({ success: false, message: '조회 오류', error: err.message });
  }
});

// 내 보유 향수 등록 (다중 등록 가능)
router.post('/', auth, async (req, res) => {
  try {
    const { perfumeIds } = req.body; // [1,2,3]
    if (!Array.isArray(perfumeIds) || perfumeIds.length === 0) {
      return res.status(400).json({ success: false, message: '향수 ID 배열을 전달하세요.' });
    }
    // 기존 보유 향수 전체 삭제 후 새로 등록 (덮어쓰기)
    await UserPerfume.destroy({ where: { user_id: req.user.userId } });
    const created = await Promise.all(
      perfumeIds.map(pid => UserPerfume.create({ user_id: req.user.userId, perfume_id: pid }))
    );
    res.json({ success: true, message: '보유 향수 등록 완료', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: '등록 오류', error: err.message });
  }
});

// 내 보유 향수 개별 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const row = await UserPerfume.destroy({ where: { id: req.params.id, user_id: req.user.userId } });
    if (!row) return res.status(404).json({ success: false, message: '데이터 없음' });
    res.json({ success: true, message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ success: false, message: '삭제 오류', error: err.message });
  }
});

// 향수별 보유 유저 수 집계 (관리자용)
router.get('/summary', async (req, res) => {
  try {
    const { Perfume, UserPerfume } = require('../models');
    // 향수별 보유 유저 수 집계
    const results = await UserPerfume.findAll({
      attributes: [
        'perfume_id',
        [Sequelize.fn('COUNT', Sequelize.col('user_id')), 'user_count']
      ],
      group: ['perfume_id'],
      include: [{ model: Perfume, attributes: ['name'] }],
      raw: true
    });
    // 결과를 향수명/유저수 형태로 가공
    const summary = results.map(r => ({
      perfume_id: r.perfume_id,
      perfume_name: r['Perfume.name'],
      user_count: r.user_count
    }));
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: '집계 오류', error: err.message });
  }
});

module.exports = router; 