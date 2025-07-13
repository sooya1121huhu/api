const FragranticaScraper = require('./src/utils/fragranticaScraper');

async function testProxy() {
  console.log('🧪 프록시 기능 테스트 시작...');
  
  const scraper = new FragranticaScraper();
  
  try {
    // 1. 프록시 리스트 가져오기 테스트
    console.log('\n1️⃣ 프록시 리스트 가져오기 테스트');
    await scraper.updateProxyList();
    console.log(`현재 프록시 개수: ${scraper.proxyList.length}`);
    
    if (scraper.proxyList.length > 0) {
      console.log('첫 번째 프록시:', scraper.proxyList[0]);
    }
    
    // 2. 간단한 향수 페이지 테스트 (프록시 사용)
    console.log('\n2️⃣ 향수 페이지 스크래핑 테스트 (프록시 사용)');
    const testUrl = 'https://www.fragrantica.com/perfume/Chanel/Chanel-No-5-EDP-612.html';
    
    const perfumeData = await scraper.scrapePerfumePage(testUrl, 2, null, true);
    
    console.log('✅ 스크래핑 성공!');
    console.log('브랜드:', perfumeData.brand);
    console.log('향수명:', perfumeData.name);
    console.log('어코드:', perfumeData.accord_1_name);
    console.log('Top Notes:', perfumeData.top_notes?.length || 0, '개');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  } finally {
    await scraper.close();
  }
}

testProxy(); 