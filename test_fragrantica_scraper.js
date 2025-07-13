const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

async function testFragranticaScraper() {
  try {
    console.log('🔄 Fragrantica 스크래핑 테스트 시작...\n');

    // 1. 단일 향수 스크래핑 테스트 (미리보기 모드)
    console.log('1️⃣ 단일 향수 스크래핑 테스트 (미리보기)...');
    
    const testUrl = 'https://www.fragrantica.com/perfume/Chanel/Chanel-No-5-EDP-612.html';
    
    const scrapeResponse = await axios.post(`${BASE_URL}/api/scrape/perfume`, {
      url: testUrl,
      auto_save: false // 미리보기 모드
    });
    
    if (!scrapeResponse.data.success) {
      console.error('❌ 스크래핑 실패:', scrapeResponse.data.message);
      return;
    }

    const perfumeData = scrapeResponse.data.data;
    console.log('✅ 스크래핑 성공!');
    console.log(`   브랜드: ${perfumeData.brand}`);
    console.log(`   향수명: ${perfumeData.name}`);
    console.log(`   노트: ${perfumeData.notes.join(', ')}`);
    console.log(`   계절: ${perfumeData.season_tags.join(', ')}`);
    console.log(`   날씨: ${perfumeData.weather_tags.join(', ')}`);
    console.log(`   분석: ${perfumeData.analysis_reason}`);
    console.log(`   중복 여부: ${scrapeResponse.data.is_duplicate ? '예' : '아니오'}`);

    // 2. 작업 상태 확인
    console.log('\n2️⃣ 스크래핑 작업 상태 확인...');
    const jobId = scrapeResponse.data.job_id;
    const statusResponse = await axios.get(`${BASE_URL}/api/scrape/status/${jobId}`);
    
    if (statusResponse.data.success) {
      console.log('✅ 작업 상태:', statusResponse.data.status);
      console.log('   진행률:', statusResponse.data.progress + '%');
    }

    // 3. 자동 저장 테스트 (선택적)
    console.log('\n3️⃣ 자동 저장 테스트 (선택적)...');
    console.log('   이 테스트는 실제로 DB에 데이터를 저장합니다.');
    console.log('   계속하시겠습니까? (y/n)');
    
    // 실제로는 사용자 입력을 받아야 하지만, 여기서는 주석 처리
    /*
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('계속하시겠습니까? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        const saveResponse = await axios.post(`${BASE_URL}/api/scrape/perfume`, {
          url: testUrl,
          auto_save: true
        });
        
        if (saveResponse.data.success) {
          console.log('✅ 자동 저장 성공!');
          console.log('   저장된 향수 ID:', saveResponse.data.saved_perfume?.id);
        } else {
          console.error('❌ 자동 저장 실패:', saveResponse.data.message);
        }
      }
      rl.close();
    });
    */

    // 4. 스크래핑 작업 목록 확인
    console.log('\n4️⃣ 스크래핑 작업 목록 확인...');
    const jobsResponse = await axios.get(`${BASE_URL}/api/scrape/jobs`);
    
    if (jobsResponse.data.success) {
      console.log(`✅ 총 ${jobsResponse.data.data.length}개의 작업이 있습니다.`);
      jobsResponse.data.data.forEach((job, index) => {
        console.log(`   ${index + 1}. 작업 ID: ${job.job_id}, 상태: ${job.status}, 진행률: ${job.progress}%`);
      });
    }

    console.log('\n🎉 Fragrantica 스크래핑 테스트 완료!');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    if (error.response) {
      console.error('   응답 데이터:', error.response.data);
    }
  }
}

// 테스트 실행
testFragranticaScraper(); 