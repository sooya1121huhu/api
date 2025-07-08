const express = require('express');
const { Perfume } = require('../models');
const router = express.Router();

// 향수 리스트 조회 (활성 상태만)
router.get('/', async (req, res) => {
  try {
    const perfumes = await Perfume.findAll({
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: perfumes
    });
  } catch (error) {
    console.error('향수 리스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '향수 리스트 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 향수 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const perfume = await Perfume.findByPk(req.params.id);
    
    if (!perfume) {
      return res.status(404).json({
        success: false,
        message: '향수를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: perfume
    });
  } catch (error) {
    console.error('향수 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '향수 상세 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 향수 등록
router.post('/', async (req, res) => {
  try {
    const { brand, name, notes, season_tags, weather_tags, analysis_reason, url } = req.body;
    
    // 필수 필드 검증
    if (!brand || !name || !notes || !season_tags || !weather_tags || !analysis_reason) {
      return res.status(400).json({
        success: false,
        message: '모든 필수 필드를 입력해주세요.'
      });
    }
    
    // 중복 검사
    const existingPerfume = await Perfume.findOne({
      where: { brand, name, status: 1 }
    });
    
    if (existingPerfume) {
      return res.status(400).json({
        success: false,
        message: '이미 등록된 향수입니다.'
      });
    }
    
    // 향수 저장
    const perfume = await Perfume.create({
      brand,
      name,
      url,
      notes,
      season_tags,
      weather_tags,
      analysis_reason,
      status: 1
    });
    
    res.status(201).json({
      success: true,
      message: '향수가 성공적으로 등록되었습니다.',
      data: perfume
    });
    
  } catch (error) {
    console.error('향수 등록 오류:', error);
    res.status(500).json({
      success: false,
      message: '향수 등록 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 향수 수정
router.put('/:id', async (req, res) => {
  try {
    const { brand, name, notes, season_tags, weather_tags, analysis_reason, url, status } = req.body;
    
    // 필수 필드 검증
    if (!brand || !name || !notes || !season_tags || !weather_tags || !analysis_reason) {
      return res.status(400).json({
        success: false,
        message: '모든 필수 필드를 입력해주세요.'
      });
    }
    
    const perfume = await Perfume.findByPk(req.params.id);
    
    if (!perfume) {
      return res.status(404).json({
        success: false,
        message: '향수를 찾을 수 없습니다.'
      });
    }
    
    // 중복 검사 (자신 제외)
    const existingPerfume = await Perfume.findOne({
      where: { 
        brand, 
        name, 
        status: 1,
        id: { [require('sequelize').Op.ne]: req.params.id }
      }
    });
    
    if (existingPerfume) {
      return res.status(400).json({
        success: false,
        message: '이미 등록된 향수입니다.'
      });
    }
    
    // 향수 수정
    await perfume.update({
      brand,
      name,
      url,
      notes,
      season_tags,
      weather_tags,
      analysis_reason,
      status: typeof status !== 'undefined' ? status : perfume.status
    });
    
    res.json({
      success: true,
      message: '향수가 성공적으로 수정되었습니다.',
      data: perfume
    });
    
  } catch (error) {
    console.error('향수 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '향수 수정 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 향수 삭제 (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const perfume = await Perfume.findByPk(req.params.id);
    
    if (!perfume) {
      return res.status(404).json({
        success: false,
        message: '향수를 찾을 수 없습니다.'
      });
    }
    
    // soft delete (status = 0)
    await perfume.update({ status: 0 });
    
    res.json({
      success: true,
      message: '향수가 성공적으로 삭제되었습니다.'
    });
    
  } catch (error) {
    console.error('향수 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '향수 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 체크박스 선택 삭제 (soft delete)
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '삭제할 향수 ID 목록을 제공해주세요.'
      });
    }
    
    // soft delete (status = 0)
    const result = await Perfume.update(
      { status: 0 },
      { 
        where: { 
          id: { [require('sequelize').Op.in]: ids },
          status: 1
        }
      }
    );
    
    res.json({
      success: true,
      message: `${result[0]}개의 향수가 성공적으로 삭제되었습니다.`
    });
    
  } catch (error) {
    console.error('향수 일괄 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '향수 일괄 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router; 