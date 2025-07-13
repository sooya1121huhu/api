const express = require('express');
const { UserPerfume, Perfume } = require('../models');
const router = express.Router();

// 날씨 카테고리 정의
const WEATHER_CATEGORIES = [
  '맑음', '흐림', '비', '눈', '더위', '추위'
];

// 계절 카테고리 정의
const SEASON_CATEGORIES = [
  '봄', '여름', '가을', '겨울'
];

// 날짜로 계절 판단
function getSeasonFromDate(date) {
  const month = new Date(date).getMonth() + 1;
  
  if (month >= 3 && month <= 5) return '봄';
  if (month >= 6 && month <= 8) return '여름';
  if (month >= 9 && month <= 11) return '가을';
  return '겨울';
}

// 향수 추천 점수 계산
function calculateRecommendationScore(perfume, targetSeason, targetWeather) {
  let score = 0;
  
  // 기본 점수 (모든 향수에 동일하게 부여)
  score += 5;
  
  return score;
}

// 향수 추천 API
router.post('/:user_id', async (req, res) => {
  try {
    const { date, weather } = req.body;
    const user_id = req.params.user_id;
    
    // 필수 필드 검증
    if (!date || !weather) {
      return res.status(400).json({
        success: false,
        message: '날짜와 날씨 정보는 필수입니다.'
      });
    }
    
    // 날씨 유효성 검사
    if (!WEATHER_CATEGORIES.includes(weather)) {
      return res.status(400).json({
        success: false,
        message: `유효하지 않은 날씨입니다. 가능한 값: ${WEATHER_CATEGORIES.join(', ')}`
      });
    }
    
    // 날짜 유효성 검사
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 날짜입니다.'
      });
    }
    
    // 계절 판단
    const targetSeason = getSeasonFromDate(date);
    
    // 사용자 보유 향수 조회
    const userPerfumes = await UserPerfume.findAll({
      where: { 
        user_id,
        status: 1
      },
      include: [{
        model: Perfume,
        where: { status: 1 },
        required: true
      }]
    });
    
    if (userPerfumes.length === 0) {
      return res.status(404).json({
        success: false,
        message: '보유한 향수가 없습니다. 먼저 향수를 추가해주세요.'
      });
    }
    
    // 향수별 추천 점수 계산
    const scoredPerfumes = userPerfumes.map(up => {
      const perfume = up.Perfume;
      const score = calculateRecommendationScore(perfume, targetSeason, weather);
      
      return {
        ...perfume.toJSON(),
        recommendation_score: score,
        matched_season: false,
        matched_weather: false
      };
    });
    
    // 점수순으로 정렬 (높은 점수 우선)
    scoredPerfumes.sort((a, b) => b.recommendation_score - a.recommendation_score);
    
    // 상위 2개 추천
    const recommendations = scoredPerfumes.slice(0, 2);
    
    // 추천 사유 생성
    const recommendationsWithReason = recommendations.map(perfume => {
      return {
        ...perfume,
        recommendation_reason: '보유한 향수 중에서 추천됩니다.'
      };
    });
    
    res.json({
      success: true,
      data: {
        target_date: date,
        target_season: targetSeason,
        target_weather: weather,
        recommendations: recommendationsWithReason,
        total_perfumes: userPerfumes.length
      }
    });
    
  } catch (error) {
    console.error('향수 추천 오류:', error);
    res.status(500).json({
      success: false,
      message: '향수 추천 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 날씨 카테고리 조회
router.get('/weather-categories', (req, res) => {
  res.json({
    success: true,
    data: WEATHER_CATEGORIES
  });
});

// 계절 카테고리 조회
router.get('/season-categories', (req, res) => {
  res.json({
    success: true,
    data: SEASON_CATEGORIES
  });
});

module.exports = router; 