const FragranticaScraper = require('./src/utils/fragranticaScraper');
const readline = require('readline');

async function waitForUserInput() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Cloudflare 인증을 완료하면 엔터를 눌러주세요! ', () => {
      rl.close();
      resolve();
    });
  });
}

async function testWithVPN() {
  console.log('🧪 VPN 사용 시 스크래핑 테스트 시작...');
  
  const scraper = new FragranticaScraper();
  const testUrl = 'https://www.fragrantica.com/perfume/COLABO/Green-Clary-Sage-Basil-84851.html';
  try {
    // 브라우저 띄우기 (프록시 없이)
    await scraper.init(false);
    const page = await scraper.browser.newPage();
    await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // 인증 대기
    await waitForUserInput();

    // 이후 스크래핑 로직 실행 (페이지 새로고침 및 데이터 추출)
    await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
    const perfumeData = await scraper.scrapePerfumePage(testUrl, 2, null, false);
    
    console.log('✅ 스크래핑 성공!');
    console.log('브랜드:', perfumeData.brand);
    console.log('향수명:', perfumeData.name);
    console.log('어코드:', perfumeData.accord_1_name);
    console.log('Top Notes:', perfumeData.top_notes?.length || 0, '개');
    console.log('Middle Notes:', perfumeData.middle_notes?.length || 0, '개');
    console.log('Base Notes:', perfumeData.base_notes?.length || 0, '개');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  } finally {
    await scraper.close();
  }
}

testWithVPN(); 