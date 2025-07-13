const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// 타임스탬프 로그 함수
function logWithTimestamp(...args) {
  const now = new Date().toISOString().replace('T', ' ').replace('Z', '');
  console.log(`[${now}]`, ...args);
}

class FragranticaScraper {
  constructor() {
    this.browser = null;
  }

  getRandomUserAgent() {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  async randomDelay(minSeconds = 5, maxSeconds = 15) {
    const delay = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
    await new Promise(resolve => setTimeout(resolve, delay * 1000));
  }

  async init() {
    if (this.browser) return;

    // 원격 디버깅 모드로 띄운 크롬에 attach
    this.browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222',
      defaultViewport: null,
    });
    logWithTimestamp('✅ 원격 디버깅 크롬에 attach 완료! (stealth 적용)');
    
    // 기존 탭들 확인
    const pages = await this.browser.pages();
    logWithTimestamp(`📋 기존 탭 ${pages.length}개 발견`);
    
    // 인증된 탭이 있는지 확인
    for (const page of pages) {
      try {
        const url = page.url();
        logWithTimestamp(`🔍 탭 URL 확인: ${url}`);
        
        // Fragrantica 도메인이면서 Cloudflare가 아닌 페이지 찾기
        if (url.includes('fragrantica.com') && 
            !url.includes('cloudflare') && 
            !url.includes('just-a-moment') &&
            !url.includes('checking-your-browser')) {
          logWithTimestamp(`✅ 인증된 탭 발견: ${url}`);
          this.authenticatedPage = page;
          break;
        }
      } catch (error) {
        logWithTimestamp(`⚠️ 탭 접근 오류: ${error.message}`);
      }
    }
    
    if (!this.authenticatedPage) {
      logWithTimestamp('⚠️ 인증된 탭을 찾을 수 없음 - 기존 탭에서 인증 시도');
      
      // 기존 탭 중 하나를 Fragrantica 메인 페이지로 이동시켜 인증 상태 확인
      if (pages.length > 0) {
        try {
          const testPage = pages[0];
          logWithTimestamp('🔍 기존 탭에서 Fragrantica 메인 페이지 접근 시도');
          
          await testPage.goto('https://www.fragrantica.com/', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
          });
          
          const title = await testPage.title();
          logWithTimestamp(`🔍 페이지 제목: ${title}`);
          
          // Cloudflare 인증이 필요한지 확인
          if (title.includes('Just a moment') || 
              title.includes('Checking your browser') || 
              title.includes('Cloudflare')) {
            logWithTimestamp('⚠️ Cloudflare 인증 필요 - 수동 인증 대기');
            // 여기서는 인증을 기다리지 않고 새 탭 사용
          } else {
            logWithTimestamp('✅ 기존 탭에서 인증 완료 확인');
            this.authenticatedPage = testPage;
          }
        } catch (error) {
          logWithTimestamp(`⚠️ 기존 탭 인증 시도 실패: ${error.message}`);
        }
      }
    } else {
      // 인증된 탭의 상태를 한 번 더 확인
      try {
        const title = await this.authenticatedPage.title();
        logWithTimestamp(`🔍 인증된 탭 제목 확인: ${title}`);
        
        // 제목에서 Cloudflare 관련 키워드가 있는지 확인
        if (title.includes('Just a moment') || 
            title.includes('Checking your browser') || 
            title.includes('Cloudflare')) {
          logWithTimestamp('⚠️ 인증된 탭이 Cloudflare 페이지로 변경됨 - 새 탭 사용');
          this.authenticatedPage = null;
        }
      } catch (error) {
        logWithTimestamp(`⚠️ 인증된 탭 상태 확인 실패: ${error.message}`);
        this.authenticatedPage = null;
      }
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // 랜덤 페이지 방문 (자연스러운 탐색 시뮬레이션)
  async visitRandomPages(page, currentUrl) {
    const randomPages = [
      // 실제 존재하는 노트 상세 페이지들
      'https://www.fragrantica.com/notes/Bergamot-75.html',
      'https://www.fragrantica.com/notes/Bigarade-1083.html',
      'https://www.fragrantica.com/notes/Bitter-Orange-79.html',
      'https://www.fragrantica.com/notes/Blood-Orange-286.html',
      'https://www.fragrantica.com/notes/Buddha-s-hand-1589.html',
      'https://www.fragrantica.com/notes/Calamansi-1028.html',
      'https://www.fragrantica.com/notes/Candied-Lemon-1485.html',
      'https://www.fragrantica.com/notes/Chen-Pi-1289.html',
      'https://www.fragrantica.com/notes/Chinotto-866.html',
      'https://www.fragrantica.com/notes/Citron-373.html',
      'https://www.fragrantica.com/notes/Citrus-Japonica-1642.html',
      'https://www.fragrantica.com/notes/Citrus-Water-1182.html',
      'https://www.fragrantica.com/notes/Citruses-313.html',
      'https://www.fragrantica.com/notes/Clementine-84.html',
      'https://www.fragrantica.com/notes/Finger-Lime-881.html',
      'https://www.fragrantica.com/notes/Grapefruit-76.html',
      'https://www.fragrantica.com/notes/Grapefruit-Leaf-933.html',
      'https://www.fragrantica.com/notes/Grapefruit-Peel-1338.html',
      'https://www.fragrantica.com/notes/Green-Tangerine-1176.html',
      'https://www.fragrantica.com/notes/Hassaku-445.html',
      'https://www.fragrantica.com/notes/Hatkora-Lemon-639.html',
      'https://www.fragrantica.com/notes/Kaffir-Lime-958.html',
      'https://www.fragrantica.com/notes/Kumquat-81.html',
      'https://www.fragrantica.com/notes/Lemon-77.html',
      'https://www.fragrantica.com/notes/Lemon-Balm-375.html',
      'https://www.fragrantica.com/notes/Lemon-Myrtle-1587.html',
      'https://www.fragrantica.com/notes/Lemon-Tree-381.html',
      'https://www.fragrantica.com/notes/Lemon-Verbena-120.html',
      'https://www.fragrantica.com/notes/Lemon-Zest-788.html',
      'https://www.fragrantica.com/notes/Lemongrass-358.html',
      'https://www.fragrantica.com/notes/Lime-78.html',
      'https://www.fragrantica.com/notes/Limetta-901.html',
      'https://www.fragrantica.com/notes/Litsea-Cubeba-529.html',
      'https://www.fragrantica.com/notes/Mandarin-Orange-82.html',
      'https://www.fragrantica.com/notes/Mandora-1044.html',
      'https://www.fragrantica.com/notes/Methyl-Pamplemousse-467.html',
      'https://www.fragrantica.com/notes/Neroli-17.html',
      'https://www.fragrantica.com/notes/Orange-80.html',
      'https://www.fragrantica.com/notes/Palestinian-Sweet-Lime-1308.html',
      'https://www.fragrantica.com/notes/Perfume-lemon-1754.html',
      'https://www.fragrantica.com/notes/Petitgrain-3.html',
      'https://www.fragrantica.com/notes/Pokan-1354.html',
      'https://www.fragrantica.com/notes/Pomelo-242.html',
      'https://www.fragrantica.com/notes/Quenepa-1729.html',
      'https://www.fragrantica.com/notes/Rangpur-1531.html',
      'https://www.fragrantica.com/notes/Red-Mandarin-1538.html',
      'https://www.fragrantica.com/notes/Rind-Bergamot-1689.html',
      'https://www.fragrantica.com/notes/Shiikuwasha-1302.html',
      'https://www.fragrantica.com/notes/Sudachi-citrus-1576.html',
      'https://www.fragrantica.com/notes/Tangelo-935.html',
      'https://www.fragrantica.com/notes/Tangerine-85.html',
      'https://www.fragrantica.com/notes/Tangerine-Zest-1441.html',
      'https://www.fragrantica.com/notes/Yuzu-83.html',
    ];
    
    // 5% 확률로 랜덤 페이지 방문 (너무 자주 방문하지 않도록 낮춤)
    if (Math.random() < 0.05) {
      const randomPage = randomPages[Math.floor(Math.random() * randomPages.length)];
      try {
        logWithTimestamp(`🎲 랜덤 페이지 방문: ${randomPage}`);
        await page.goto(randomPage, { 
          waitUntil: 'domcontentloaded', 
          timeout: 30000 
        });
        
        // 랜덤 페이지에서 2~5초 대기
        const randomWait = Math.floor(Math.random() * 3000) + 2000;
        await new Promise(resolve => setTimeout(resolve, randomWait));
        
        // 원래 페이지로 돌아가기
        logWithTimestamp(`🔄 원래 페이지로 복귀: ${currentUrl}`);
        await page.goto(currentUrl, { 
          waitUntil: 'domcontentloaded', 
          timeout: 30000 
        });
        
        // 페이지 로딩 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        logWithTimestamp(`⚠️ 랜덤 페이지 방문 실패 (무시): ${error.message}`);
      }
    }
  }

  // 페이지 설정 공통 로직
  async setupPage(page) {
    // User-Agent 설정
    try {
      const userAgent = this.getRandomUserAgent();
      await page.setUserAgent(userAgent);
      logWithTimestamp(`🔄 User-Agent 설정: ${userAgent}`);
    } catch (error) {
      logWithTimestamp(`⚠️ User-Agent 설정 실패 (무시): ${error.message}`);
    }
    
    // 자동화 탐지 우회
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });
  }

  // 페이지 로딩 및 대기 공통 로직
  async waitForPageLoad(page, url) {
    logWithTimestamp(`📦 페이지 로딩 중: ${url}`);
    
    // 페이지 로딩
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });
    
    // 429 에러 체크
    const title = await page.title();
    if (title.includes('429 Too Many Requests')) {
      throw new Error('429 Too Many Requests');
    }
    
    // 랜덤 페이지 방문
    await this.visitRandomPages(page, url);
    
    // 기본 페이지 로딩 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
    logWithTimestamp('✅ 기본 페이지 로딩 완료');
  }

  // 어코드 전용 대기 로직
  async waitForAccords(page) {
    logWithTimestamp('⏳ 어코드 로딩 대기 중...');
    try {
      // 1단계: "main accords" h6 요소 찾기
      await page.waitForSelector('h6', { timeout: 15000 });
      logWithTimestamp('✅ main accords h6 요소 발견');
      
      // 2단계: grid-x 컨테이너 찾기
      await page.waitForSelector('.grid-x', { timeout: 20000 });
      logWithTimestamp('✅ grid-x 컨테이너 발견');
      
      // 3단계: cell accord-box 요소들이 로드될 때까지 대기
      await page.waitForSelector('.cell.accord-box', { timeout: 20000 });
      logWithTimestamp('✅ cell accord-box 요소 발견');

      // 4단계: accord-bar에 width 스타일이 설정될 때까지 대기
      await page.waitForFunction(
        () => {
          const bars = Array.from(document.querySelectorAll('.accord-bar'));
          if (bars.length === 0) return false;
          // 최소 하나라도 width가 설정되어 있으면 OK
          return bars.some(el => {
            const style = el.getAttribute('style') || '';
            return /width:\s*\d+%/.test(style);
          });
        },
        { timeout: 20000 }
      );
      logWithTimestamp('✅ accord-bar width 값 로드 확인');

      // 어코드 완전 로드 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
      logWithTimestamp('✅ 어코드 로딩 완료');
      
    } catch (error) {
      logWithTimestamp('⚠️ 어코드 요소 대기 실패, 계속 진행:', error.message);
    }
  }

  // 노트 전용 대기 로직
  async waitForNotes(page) {
    logWithTimestamp('⏳ 노트 로딩 대기 중...');
    try {
      // 1단계: .pyramid 요소 찾기 시도 (top/middle/base 노트용)
      try {
        await page.waitForSelector('.pyramid', { timeout: 5000 });
        logWithTimestamp('✅ pyramid 노트 요소 발견');
      } catch (error) {
        logWithTimestamp('⚠️ pyramid 요소 없음 - fragrance_notes만 있는 향수일 수 있음');
      }
      
      // 2단계: fragrance_notes용 flex 컨테이너 찾기 시도
      try {
        await page.waitForSelector('div[style*="display: flex"][style*="justify-content: center"][style*="text-align: center"][style*="flex-flow: wrap"][style*="align-items: flex-end"][style*="padding: 0.5rem"]', { timeout: 5000 });
        logWithTimestamp('✅ fragrance_notes flex 컨테이너 발견');
      } catch (error) {
        logWithTimestamp('⚠️ fragrance_notes flex 컨테이너 없음');
      }
      
      // 노트 완전 로드 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
      logWithTimestamp('✅ 노트 로딩 완료');
      
    } catch (error) {
      logWithTimestamp('⚠️ 노트 요소 대기 실패, 계속 진행:', error.message);
    }
  }

  async scrapePerfumePage(url, maxRetries = 3, brandName = null) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.init();
        const page = await this.browser.newPage();
        
        // 브라우저 콘솔 로그를 서버로 출력
        page.on('console', msg => {
          const text = msg.text();
          if (text.includes('🔍') || text.includes('✅')) {
            logWithTimestamp(`[브라우저] ${text}`);
          }
        });
        
        logWithTimestamp(`🔄 새 탭 생성 및 이동: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await this.waitForAccords(page);
        const accords = await this.extractMainAccordsFromPage(page);
        logWithTimestamp('🔎 추출된 accords:', accords);
        await this.waitForNotes(page);
        const notes = await this.extractNotesFromPage(page);
        logWithTimestamp('🔎 추출된 notes:', notes);
        const brand = brandName || await page.evaluate(() => {
          const brandElement = document.querySelector('span[itemprop="name"]');
          return brandElement ? brandElement.textContent.trim() : 'Unknown Brand';
        });
        const name = await page.evaluate(() => {
          const nameElement = document.querySelector('h1.text-center.medium-text-left');
          if (nameElement) {
            const fullText = nameElement.textContent.trim();
            return fullText.replace(/\s+for\s+women\s+and\s+men.*$/i, '').trim();
          }
          return 'Unknown Perfume';
        });
        const perfumeData = {
          brand: brand,
          name: name,
          url: url,
          accord_1_name: accords[0]?.name || null,
          accord_1_width: accords[0]?.width || null,
          accord_2_name: accords[1]?.name || null,
          accord_2_width: accords[1]?.width || null,
          accord_3_name: accords[2]?.name || null,
          accord_3_width: accords[2]?.width || null,
          accord_4_name: accords[3]?.name || null,
          accord_4_width: accords[3]?.width || null,
          accord_5_name: accords[4]?.name || null,
          accord_5_width: accords[4]?.width || null,
          top_notes: notes.top || [],
          middle_notes: notes.middle || [],
          base_notes: notes.base || [],
          fragrance_notes: notes.fragrance || []
        };
        logWithTimestamp('💾 저장 직전 perfumeData:', perfumeData);
        await page.close();
        logWithTimestamp('🧹 탭 정리 완료');
        return this.cleanPerfumeData(perfumeData);
      } catch (error) {
        lastError = error;
        logWithTimestamp(`❌ 시도 ${attempt} 실패:`, error.message);
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
          logWithTimestamp('🚫 429 에러 감지! 10분 대기 후 재시도...');
          await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));
        } else if (attempt < maxRetries) {
          logWithTimestamp(`⏳ ${attempt}초 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }
    throw lastError;
  }

  // 브랜드 페이지에서 브랜드명과 향수 링크들 추출
  async scrapeBrandPage(brandUrl) {
    await this.init();
    const page = await this.browser.newPage();
    logWithTimestamp(`🔄 새 탭 생성 및 이동(브랜드): ${brandUrl}`);
    await page.goto(brandUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    // 이하 기존 scrapeBrandPage 코드에서 page.goto 등 이동/새로고침 없이 DOM만 읽어서 추출
    // 브랜드명 추출
    const brandName = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1) {
        const text = h1.textContent.trim();
        return text.replace(/\s+Perfumes?\s+And?\s+Colognes?/i, '').trim();
      }
      const urlParts = window.location.pathname.split('/');
      const designerIndex = urlParts.indexOf('designers');
      if (designerIndex !== -1 && urlParts[designerIndex + 1]) {
        return urlParts[designerIndex + 1].replace('.html', '').replace(/-/g, ' ');
      }
      return 'Unknown Brand';
    });

    // 향수 링크 추출
    const { allPerfumeLinks, collections } = await page.evaluate(() => {
      // 1. 컬렉션 id/이름 추출
      const collectionNodes = Array.from(document.querySelectorAll('p[data-magellan] a[href^="#"]'));
      const collections = collectionNodes.map(a => ({
        id: a.getAttribute('href').replace('#', ''),
        name: a.textContent.trim()
      }));
      
      // 2. 각 컬렉션 섹션에서 향수 링크 추출
      let allLinks = [];
      for (const { id } of collections) {
        const section = document.querySelector(`div#${id}`);
        if (!section) continue;
        const perfumeDivs = Array.from(section.parentNode.querySelectorAll(`div#${id} ~ .cell.prefumeHbox, div#${id}`));
        for (const div of perfumeDivs) {
          const a = div.querySelector('h3 a[href*="/perfume/"]');
          if (a) {
            let href = a.getAttribute('href');
            if (href && !href.startsWith('http')) {
              href = 'https://www.fragrantica.com' + href;
            }
            allLinks.push(href);
          }
        }
      }
      // 중복 제거
      allLinks = Array.from(new Set(allLinks));
      return { allPerfumeLinks: allLinks, collections };
    });

    // 기존 탭은 닫지 않음 (재사용을 위해)
    const currentPages = await this.browser.pages();
    if (currentPages.length > 1) {
      // 여러 탭이 있으면 새로 생성한 탭만 닫기
      await page.close();
      logWithTimestamp('🧹 새 탭 정리 완료 (브랜드 페이지)');
    } else {
      logWithTimestamp('🔄 기존 탭 유지 (브랜드 페이지)');
    }
    
    return {
      brandName,
      perfumeLinks: allPerfumeLinks,
      collections
    };
  }

  // 어코드 추출
  async extractMainAccordsFromPage(page) {
    return await page.evaluate(() => {
      const accords = [];
      
      // 올바른 순서로 어코드 추출
      // 1. h6 요소 찾기
      const h6Element = document.querySelector('h6');
      if (!h6Element) {
        console.log('h6 요소를 찾을 수 없음');
        return accords;
      }
      
      // 2. h6 다음에 있는 grid-x 컨테이너 찾기
      const gridX = h6Element.nextElementSibling;
      if (!gridX || !gridX.classList.contains('grid-x')) {
        console.log('grid-x 컨테이너를 찾을 수 없음');
        return accords;
      }
      
      // 3. grid-x 안의 cell accord-box 요소들을 순서대로 찾기
      const accordBoxes = gridX.querySelectorAll('.cell.accord-box');
      accordBoxes.forEach((box, index) => {
        if (index >= 5) return; // 최대 5개만
        
        // 4. 각 accord-box 안의 accord-bar 찾기
        const accordBar = box.querySelector('.accord-bar');
        if (accordBar) {
          const name = accordBar.textContent.trim();
          const style = accordBar.getAttribute('style') || '';
          const widthMatch = style.match(/width:\s*([\d.]+)%/);
          const width = widthMatch ? parseFloat(widthMatch[1]) : null;
          
          // 디버깅용 로그
          console.log(`Accord ${index + 1}: name="${name}", style="${style}", width=${width}`);
          
          if (name && name !== 'Unknown' && name !== '' && name.length > 1) {
            accords.push({ name, width });
          }
        }
      });
      
      return accords;
    });
  }

  // 노트 추출 (단순화된 버전)
  async extractNotesFromPage(page) {
    return await page.evaluate(() => {
      const result = { top: [], middle: [], base: [], fragrance: [] };
      
      // h4, h5 등 다양한 heading 태그에서 노트 추출
      const headingTags = Array.from(document.querySelectorAll('h4, h5'));
      
      headingTags.forEach(h => {
        const title = h.textContent.trim().toLowerCase();
        let targetArray = null;
        
        if (title.includes('top')) targetArray = result.top;
        else if (title.includes('middle')) targetArray = result.middle;
        else if (title.includes('base')) targetArray = result.base;
        else if (title.includes('fragrance notes')) targetArray = result.fragrance;
        
        if (targetArray) {
          let div = h.nextElementSibling;
          if (div && div.tagName.toLowerCase() === 'div') {
            const noteDivs = div.querySelectorAll('div[style*="margin: 0.2rem"], div');
            noteDivs.forEach(noteDiv => {
              const subDivs = noteDiv.querySelectorAll('div');
              let noteText = null;
              if (subDivs.length > 1) {
                noteText = subDivs[1].textContent.trim();
              } else if (subDivs.length === 1) {
                noteText = subDivs[0].textContent.trim();
              } else {
                noteText = noteDiv.textContent.trim();
              }
              if (noteText && !targetArray.includes(noteText)) {
                targetArray.push(noteText);
              }
            });
          }
        }
      });
      
      // top/middle/base가 모두 비어 있으면 fragrance_notes 찾기
      if (!result.top.length && !result.middle.length && !result.base.length) {
        console.log('🔍 fragrance_notes 찾기 시작');
        
        // 1. 더 간단한 선택자로 flex 컨테이너 찾기
        const flexContainer = document.querySelector('div[style*="display: flex"][style*="padding: 0.5rem"]');
        
        console.log('🔍 flexContainer 찾음:', !!flexContainer);
        
        if (flexContainer) {
          console.log('🔍 flexContainer HTML:', flexContainer.outerHTML);
          
          // 2. 그 안의 margin: 0.2rem 요소들 찾기
          const noteElements = flexContainer.querySelectorAll('div[style*="margin: 0.2rem"]');
          
          console.log('🔍 noteElements 개수:', noteElements.length);
          
          noteElements.forEach((noteElement, index) => {
            console.log(`🔍 noteElement ${index + 1} HTML:`, noteElement.outerHTML);
            
            // 3. 2번째 div에서 </a> 다음 텍스트 추출
            const divs = noteElement.querySelectorAll('div');
            console.log(`🔍 noteElement ${index + 1} divs 개수:`, divs.length);
            
            if (divs.length >= 2) {
              const secondDiv = divs[1];
              console.log(`🔍 noteElement ${index + 1} secondDiv HTML:`, secondDiv.outerHTML);
              
              const anchor = secondDiv.querySelector('a');
              console.log(`🔍 noteElement ${index + 1} anchor 찾음:`, !!anchor);
              
              if (anchor) {
                // </a> 다음 텍스트 추출 (anchor 태그 밖의 텍스트)
                const anchorText = secondDiv.textContent.trim();
                console.log(`🔍 noteElement ${index + 1} anchorText:`, anchorText);
                
                if (anchorText && !result.fragrance.includes(anchorText)) {
                  result.fragrance.push(anchorText);
                  console.log(`✅ fragrance_notes에 추가:`, anchorText);
                }
              }
            }
          });
        }
        
        console.log('🔍 최종 fragrance_notes:', result.fragrance);
      }
      
      return result;
    });
  }

  // 데이터 정리
  cleanPerfumeData(perfumeData) {
    const cleaned = { ...perfumeData };

    // 문자열 필드 정리
    ['brand', 'name', 'url'].forEach(field => {
      if (cleaned[field]) {
        cleaned[field] = cleaned[field].trim();
      }
    });

    // 노트 정리
    const isTopEmpty = !cleaned.top_notes || cleaned.top_notes.length === 0;
    const isMiddleEmpty = !cleaned.middle_notes || cleaned.middle_notes.length === 0;
    const isBaseEmpty = !cleaned.base_notes || cleaned.base_notes.length === 0;
    const isFragranceExist = cleaned.fragrance_notes && cleaned.fragrance_notes.length > 0;

    if (isTopEmpty && isMiddleEmpty && isBaseEmpty && isFragranceExist) {
      // fragrance_notes만 있을 때: fragrance_notes만 저장, 나머지는 null
      cleaned.top_notes = null;
      cleaned.middle_notes = null;
      cleaned.base_notes = null;
    } else {
      // top/middle/base 중 하나라도 있으면 각각 저장, fragrance_notes는 빈 배열
      cleaned.fragrance_notes = [];
    }

    // 어코드 필드 정리
    for (let i = 1; i <= 5; i++) {
      const nameField = `accord_${i}_name`;
      const widthField = `accord_${i}_width`;
      
      if (cleaned[nameField]) {
        cleaned[nameField] = cleaned[nameField].trim();
      }
      
      if (cleaned[widthField] && typeof cleaned[widthField] === 'string') {
        const width = parseInt(cleaned[widthField]);
        cleaned[widthField] = isNaN(width) ? null : width;
      }
    }

    return cleaned;
  }
}

module.exports = FragranticaScraper; 