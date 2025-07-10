const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'; // 서버 포트에 맞게 수정

async function testSimilarPerfumesAPI() {
  try {
    console.log('🔄 유사 향수 추천 API 테스트 시작...\n');

    // 1. 먼저 향수 리스트를 가져와서 테스트할 향수 ID 확인
    console.log('1️⃣ 향수 리스트 조회 중...');
    const perfumesResponse = await axios.get(`${BASE_URL}/api/perfumes`);
    
    if (!perfumesResponse.data.success) {
      console.error('❌ 향수 리스트 조회 실패:', perfumesResponse.data.message);
      return;
    }

    const perfumes = perfumesResponse.data.data;
    console.log(`✅ 총 ${perfumes.length}개의 향수를 찾았습니다.`);

    if (perfumes.length === 0) {
      console.log('⚠️ 테스트할 향수가 없습니다. 먼저 향수를 등록해주세요.');
      return;
    }

    // 첫 번째 향수로 테스트
    const testPerfume = perfumes[0];
    console.log(`\n2️⃣ 테스트 대상 향수: ${testPerfume.brand} - ${testPerfume.name}`);
    console.log(`   노트: ${testPerfume.notes.join(', ')}`);

    // 2. 유사 향수 추천 API 테스트
    console.log('\n3️⃣ 유사 향수 추천 API 호출 중...');
    const similarResponse = await axios.get(`${BASE_URL}/api/perfumes/${testPerfume.id}/similar`);
    
    if (!similarResponse.data.success) {
      console.error('❌ 유사 향수 추천 실패:', similarResponse.data.message);
      return;
    }

    const result = similarResponse.data.data;
    console.log(`✅ 유사 향수 추천 성공!`);
    console.log(`   - 총 유사 향수 수: ${result.total_similar_count}`);
    console.log(`   - 반환된 향수 수: ${result.returned_count}`);

    // 3. 결과 상세 출력
    if (result.similar_perfumes.length > 0) {
      console.log('\n📋 유사 향수 목록:');
      result.similar_perfumes.forEach((perfume, index) => {
        console.log(`\n${index + 1}. ${perfume.brand} - ${perfume.name}`);
        console.log(`   공통 노트 (${perfume.common_notes_count}개): ${perfume.common_notes.join(', ')}`);
        console.log(`   전체 노트: ${perfume.notes.join(', ')}`);
      });
    } else {
      console.log('\n📋 유사한 향수가 없습니다.');
    }

    console.log('\n✅ 테스트 완료!');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
    }
  }
}

// 스크립트 실행
testSimilarPerfumesAPI(); 