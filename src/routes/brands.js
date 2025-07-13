const express = require('express');
const router = express.Router();
const { PerfumeBrand } = require('../models');

// =====================================================
// 브랜드 목록 조회 (활성 상태만)
// =====================================================
router.get('/', async (req, res) => {
  try {
    const { include } = req.query;
    
    let queryOptions = {
      where: { status: 1 },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    };
    
    // 향수 개수 포함 요청인 경우
    if (include === 'perfume_count') {
      const { Perfume } = require('../models');
      const { Op } = require('sequelize');
      
      const brandsWithCount = await PerfumeBrand.findAll({
        where: { status: 1 },
        attributes: [
          'id', 
          'name',
          [require('sequelize').fn('COUNT', require('sequelize').col('Perfumes.id')), 'perfume_count']
        ],
        include: [{
          model: Perfume,
          attributes: [],
          where: { status: 1 }
        }],
        group: ['PerfumeBrand.id'],
        order: [['name', 'ASC']]
      });
      
      return res.json({
        success: true,
        data: brandsWithCount
      });
    }
    
    const brands = await PerfumeBrand.findAll(queryOptions);
    
    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    console.error('브랜드 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '브랜드 목록을 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// =====================================================
// 모든 브랜드 목록 조회 (관리자용)
// =====================================================
router.get('/all', async (req, res) => {
  try {
    const brands = await PerfumeBrand.findAll({
      attributes: ['id', 'name', 'status', 'created_at', 'updated_at'],
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    console.error('전체 브랜드 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '브랜드 목록을 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// =====================================================
// 브랜드 상세 조회
// =====================================================
router.get('/:id', async (req, res) => {
  try {
    const brandId = req.params.id;
    const brand = await PerfumeBrand.findByPk(brandId);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: '브랜드를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('브랜드 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '브랜드 정보를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// =====================================================
// 브랜드 생성
// =====================================================
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '브랜드명은 필수입니다.'
      });
    }
    
    // 중복 브랜드명 확인
    const existingBrand = await PerfumeBrand.findOne({
      where: { name: name.trim() }
    });
    
    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 브랜드명입니다.'
      });
    }
    
    const newBrand = await PerfumeBrand.create({
      name: name.trim(),
      status: 0 // 기본적으로 삭제 상태로 생성
    });
    
    res.status(201).json({
      success: true,
      message: '브랜드가 성공적으로 생성되었습니다.',
      data: newBrand
    });
  } catch (error) {
    console.error('브랜드 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '브랜드 생성 중 오류가 발생했습니다.'
    });
  }
});

// =====================================================
// 브랜드 상태 변경 (활성화/비활성화)
// =====================================================
router.patch('/:id/status', async (req, res) => {
  try {
    const brandId = req.params.id;
    const { status } = req.body;
    
    if (status !== 0 && status !== 1) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 상태값입니다. (0: 삭제, 1: 사용중)'
      });
    }
    
    const brand = await PerfumeBrand.findByPk(brandId);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: '브랜드를 찾을 수 없습니다.'
      });
    }
    
    await brand.update({ status });
    
    res.json({
      success: true,
      message: `브랜드 상태가 ${status === 1 ? '활성화' : '비활성화'}되었습니다.`,
      data: brand
    });
  } catch (error) {
    console.error('브랜드 상태 변경 오류:', error);
    res.status(500).json({
      success: false,
      message: '브랜드 상태 변경 중 오류가 발생했습니다.'
    });
  }
});

// =====================================================
// 브랜드 수정
// =====================================================
router.put('/:id', async (req, res) => {
  try {
    const brandId = req.params.id;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '브랜드명은 필수입니다.'
      });
    }
    
    const brand = await PerfumeBrand.findByPk(brandId);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: '브랜드를 찾을 수 없습니다.'
      });
    }
    
    // 중복 브랜드명 확인 (자신 제외)
    const existingBrand = await PerfumeBrand.findOne({
      where: { 
        name: name.trim(),
        id: { [require('sequelize').Op.ne]: brandId }
      }
    });
    
    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 브랜드명입니다.'
      });
    }
    
    await brand.update({ name: name.trim() });
    
    res.json({
      success: true,
      message: '브랜드가 성공적으로 수정되었습니다.',
      data: brand
    });
  } catch (error) {
    console.error('브랜드 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '브랜드 수정 중 오류가 발생했습니다.'
    });
  }
});

// =====================================================
// 브랜드 삭제 (실제 삭제가 아닌 상태 변경)
// =====================================================
router.delete('/:id', async (req, res) => {
  try {
    const brandId = req.params.id;
    
    const brand = await PerfumeBrand.findByPk(brandId);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: '브랜드를 찾을 수 없습니다.'
      });
    }
    
    // 해당 브랜드를 사용하는 향수가 있는지 확인
    const perfumeCount = await require('../models').Perfume.count({
      where: { brand_id: brandId }
    });
    
    if (perfumeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `이 브랜드를 사용하는 향수가 ${perfumeCount}개 있습니다. 먼저 향수를 삭제하거나 다른 브랜드로 변경해주세요.`
      });
    }
    
    await brand.update({ status: 0 });
    
    res.json({
      success: true,
      message: '브랜드가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('브랜드 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '브랜드 삭제 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router; 