const express = require('express');
const { Perfume, PerfumeBrand } = require('../models');
const { calculateNoteSimilarity } = require('../utils/noteSimilarity');
const router = express.Router();

// 향수 리스트 조회 (활성 상태만, 브랜드 정보 포함)
router.get('/', async (req, res) => {
  try {
    const perfumes = await Perfume.findAll({
      include: [{
        model: PerfumeBrand,
        as: 'PerfumeBrand',
        attributes: ['id', 'name']
      }],
      where: { status: 1 },
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

// 향수 상세 조회 (브랜드 정보 포함)
router.get('/:id', async (req, res) => {
  try {
    const perfume = await Perfume.findByPk(req.params.id, {
      include: [{
        model: PerfumeBrand,
        as: 'PerfumeBrand',
        attributes: ['id', 'name', 'status']
      }]
    });
    
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

// 유사 향수 추천 API
router.get('/:id/similar', async (req, res) => {
  try {
    const perfume = await Perfume.findByPk(req.params.id, {
      include: [{
        model: PerfumeBrand,
        as: 'PerfumeBrand',
        attributes: ['id', 'name']
      }]
    });
    
    if (!perfume) {
      return res.status(404).json({
        success: false,
        message: '향수를 찾을 수 없습니다.'
      });
    }

    // 현재 향수의 노트 배열
    console.log('perfume.notes:', perfume.notes, 'type:', typeof perfume.notes);
    const currentNotes = perfume.notes || [];
    
    if (currentNotes.length === 0) {
      return res.json({
        success: true,
        data: {
          target_perfume: perfume,
          similar_perfumes: [],
          message: '노트 정보가 없어 유사 향수를 찾을 수 없습니다.'
        }
      });
    }

    // 모든 활성 향수 조회 (현재 향수 제외, 브랜드 정보 포함)
    const allPerfumes = await Perfume.findAll({
      include: [{
        model: PerfumeBrand,
        as: 'PerfumeBrand',
        attributes: ['id', 'name']
      }],
      where: {
        id: { [require('sequelize').Op.ne]: req.params.id },
        status: 1
      }
    });

    // 유사 향수 필터링 (2개 이상의 공통 노트가 있는 향수)
    const similarPerfumes = allPerfumes.filter(targetPerfume => {
      const targetNotes = targetPerfume.notes || [];
      console.log('targetPerfume.notes:', targetPerfume.notes, 'type:', typeof targetPerfume.notes);
      
      // 새로운 노트 유사성 계산 함수 사용
      const similarity = calculateNoteSimilarity(currentNotes, targetNotes);
      return similarity.count >= 2;
    }).map(targetPerfume => {
      const targetNotes = targetPerfume.notes || [];
      
      // 새로운 노트 유사성 계산 함수 사용
      const similarity = calculateNoteSimilarity(currentNotes, targetNotes);
      
      return {
        ...targetPerfume.toJSON(),
        common_notes: similarity.commonNotes,
        common_notes_count: similarity.count
      };
    })
    // 자기 자신은 유사 향수에서 제외
    .filter(perfume => perfume.id != req.params.id);

    // 공통 노트 개수순으로 정렬 (높은 순)
    similarPerfumes.sort((a, b) => b.common_notes_count - a.common_notes_count);

    // 상위 10개만 반환
    const topSimilarPerfumes = similarPerfumes.slice(0, 10);

    res.json({
      success: true,
      data: {
        target_perfume: perfume,
        similar_perfumes: topSimilarPerfumes,
        total_similar_count: similarPerfumes.length,
        returned_count: topSimilarPerfumes.length
      }
    });

  } catch (error) {
    console.error('유사 향수 추천 오류:', error);
    res.status(500).json({
      success: false,
      message: '유사 향수 추천 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 향수 등록
router.post('/', async (req, res) => {
  try {
    const { brand_id, name, notes, season_tags, weather_tags, analysis_reason } = req.body;
    
    // 필수 필드 검증
    if (!brand_id || !name || !notes || !season_tags || !weather_tags || !analysis_reason) {
      return res.status(400).json({
        success: false,
        message: '모든 필수 필드를 입력해주세요.'
      });
    }
    
    // 브랜드 존재 확인
    const brand = await PerfumeBrand.findByPk(brand_id);
    if (!brand || brand.status !== 1) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 브랜드입니다.'
      });
    }
    
    // 중복 검사
    const existingPerfume = await Perfume.findOne({
      where: { brand_id, name, status: 1 }
    });
    
    if (existingPerfume) {
      return res.status(400).json({
        success: false,
        message: '이미 등록된 향수입니다.'
      });
    }
    
    // 향수 저장
    const perfume = await Perfume.create({
      brand_id,
      name,
      notes,
      season_tags,
      weather_tags,
      analysis_reason,
      status: 1
    });
    
    // 브랜드 정보와 함께 반환
    const perfumeWithBrand = await Perfume.findByPk(perfume.id, {
      include: [{
        model: PerfumeBrand,
        as: 'PerfumeBrand',
        attributes: ['id', 'name']
      }]
    });
    
    res.status(201).json({
      success: true,
      message: '향수가 성공적으로 등록되었습니다.',
      data: perfumeWithBrand
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
    const { brand_id, name, notes, season_tags, weather_tags, analysis_reason, status } = req.body;
    
    // 필수 필드 검증
    if (!brand_id || !name || !notes || !season_tags || !weather_tags || !analysis_reason) {
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
    
    // 브랜드 존재 확인
    const brand = await PerfumeBrand.findByPk(brand_id);
    if (!brand || brand.status !== 1) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 브랜드입니다.'
      });
    }
    
    // 중복 검사 (자신 제외)
    const existingPerfume = await Perfume.findOne({
      where: { 
        brand_id, 
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
      brand_id,
      name,
      notes,
      season_tags,
      weather_tags,
      analysis_reason,
      status: typeof status !== 'undefined' ? status : perfume.status
    });
    
    // 브랜드 정보와 함께 반환
    const updatedPerfume = await Perfume.findByPk(req.params.id, {
      include: [{
        model: PerfumeBrand,
        as: 'PerfumeBrand',
        attributes: ['id', 'name']
      }]
    });
    
    res.json({
      success: true,
      message: '향수가 성공적으로 수정되었습니다.',
      data: updatedPerfume
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