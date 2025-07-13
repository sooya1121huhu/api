const express = require('express');
const router = express.Router();
const FragranticaScraper = require('../utils/fragranticaScraper');
const { Perfume, PerfumeBrand } = require('../models');

// 스크래핑 작업 상태 저장
const scrapingJobs = new Map();
const bulkScrapingJobs = new Map();

// =====================================================
// 단일 향수 페이지 스크래핑
// =====================================================
router.post('/perfume', async (req, res) => {
  const { url, auto_save = false } = req.body;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      message: 'URL은 필수입니다.'
    });
  }

  // Fragrantica URL 검증
  if (!url.includes('fragrantica.com')) {
    return res.status(400).json({
      success: false,
      message: 'Fragrantica URL만 지원됩니다.'
    });
  }

  const jobId = Date.now().toString();
  scrapingJobs.set(jobId, { status: 'processing', progress: 0 });

  try {
    console.log(`🚀 Fragrantica 스크래핑 시작: ${url}`);
    
    const scraper = new FragranticaScraper();
    
    // 스크래핑 실행 (최대 3회 재시도, VPN 사용 시 프록시는 끄기)
    const perfumeData = await scraper.scrapePerfumePage(url, 3, null, false);
    
    // 노트 정규화 (더 이상 notes 사용하지 않음)
    // perfumeData.notes = scraper.normalizeNotes(perfumeData.notes);
    
    // URL로 중복 검사
    const existingPerfume = await Perfume.findOne({
      where: { url: url, status: 1 }
    });

    if (existingPerfume) {
      await scraper.close();
      scrapingJobs.set(jobId, { 
        status: 'completed', 
        progress: 100,
        data: perfumeData,
        is_duplicate: true,
        existing_perfume: existingPerfume
      });

      return res.json({
        success: true,
        job_id: jobId,
        message: '이미 등록된 향수입니다.',
        data: perfumeData,
        is_duplicate: true,
        existing_perfume: existingPerfume
      });
    }

    let savedPerfume = null;
    
    // 자동 저장이 활성화된 경우
    if (auto_save) {
      // 브랜드 확인/생성
      let brand = await PerfumeBrand.findOne({
        where: { name: perfumeData.brand, status: 1 }
      });

      if (!brand) {
        brand = await PerfumeBrand.create({
          name: perfumeData.brand,
          status: 1
        });
        console.log(`✅ 새 브랜드 생성: ${perfumeData.brand}`);
      }

      // 향수 저장
      savedPerfume = await Perfume.create({
        brand_id: brand.id,
        name: perfumeData.name,
        url: url,
        accord_1_name: perfumeData.accord_1_name,
        accord_1_width: perfumeData.accord_1_width,
        accord_2_name: perfumeData.accord_2_name,
        accord_2_width: perfumeData.accord_2_width,
        accord_3_name: perfumeData.accord_3_name,
        accord_3_width: perfumeData.accord_3_width,
        accord_4_name: perfumeData.accord_4_name,
        accord_4_width: perfumeData.accord_4_width,
        accord_5_name: perfumeData.accord_5_name,
        accord_5_width: perfumeData.accord_5_width,
        top_notes: JSON.stringify(perfumeData.top_notes),
        middle_notes: JSON.stringify(perfumeData.middle_notes),
        base_notes: JSON.stringify(perfumeData.base_notes),
        fragrance_notes: JSON.stringify(perfumeData.fragrance_notes),
        status: 1
      });

      // 브랜드 정보와 함께 반환
      savedPerfume = await Perfume.findByPk(savedPerfume.id, {
        include: [{
          model: PerfumeBrand,
          as: 'PerfumeBrand',
          attributes: ['id', 'name']
        }]
      });

      console.log(`✅ 향수 저장 완료: ${perfumeData.brand} - ${perfumeData.name}`);
    }

    await scraper.close();
    
    scrapingJobs.set(jobId, { 
      status: 'completed', 
      progress: 100,
      data: perfumeData,
      saved_perfume: savedPerfume
    });

    res.json({
      success: true,
      job_id: jobId,
      message: auto_save ? '향수가 성공적으로 저장되었습니다.' : '스크래핑이 완료되었습니다.',
      data: perfumeData,
      saved_perfume: savedPerfume,
      is_duplicate: false
    });

  } catch (error) {
    console.error('스크래핑 오류:', error);
    
    scrapingJobs.set(jobId, { 
      status: 'failed', 
      progress: 0,
      error: error.message
    });

    res.status(500).json({
      success: false,
      job_id: jobId,
      message: '스크래핑 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// =====================================================
// 브랜드별 향수 목록 스크래핑
// =====================================================
router.post('/brand', async (req, res) => {
  console.log('==== /api/scrape/brand 진입 ====');
  const { brand_url, limit = null, auto_save = false, batch_save = false } = req.body;
  
  if (!brand_url) {
    console.log('==== 브랜드 URL 누락, 요청 종료 ====');
    return res.status(400).json({
      success: false,
      message: '브랜드 URL은 필수입니다.'
    });
  }

  const jobId = Date.now().toString();
  scrapingJobs.set(jobId, { status: 'processing', progress: 0 });

  try {
    console.log('==== 브랜드 스크래핑 함수 진입 ====');
    
    const scraper = new FragranticaScraper();
    const results = [];
    let savedCount = 0;
    let duplicateCount = 0;
    let batchData = []; // 배치 저장용 데이터
    
    // 1단계: 브랜드 페이지에서 브랜드명과 향수 링크들 추출 (최대 3회 재시도)
    console.log('1️⃣ 브랜드 페이지에서 브랜드명과 향수 링크 추출 중...');
    const brandData = await scraper.scrapeBrandPage(brand_url, 3);
    
    console.log(`✅ 브랜드명: ${brandData.brandName}`);
    console.log(`✅ 발견된 향수 링크 개수: ${brandData.perfumeLinks.length}`);
    
    // 브랜드가 DB에 있는지 확인하고 없으면 생성
    let brand = await PerfumeBrand.findOne({
      where: { name: brandData.brandName, status: 1 }
    });

    if (!brand && auto_save) {
      brand = await PerfumeBrand.create({
        name: brandData.brandName,
        status: 1
      });
      console.log(`✅ 새 브랜드 생성: ${brandData.brandName} (ID: ${brand.id})`);
    } else if (brand) {
      console.log(`✅ 기존 브랜드 발견: ${brandData.brandName} (ID: ${brand.id})`);
    }
    
    // ★ 테스트용: 최대 2개 향수만 처리
    const limitedPerfumeLinks = brandData.perfumeLinks; // 전체 향수 링크 처리
    const maxPerfumes = limitedPerfumeLinks.length;
    
    console.log(`📋 ${limitedPerfumeLinks.length}개의 향수 링크 전체 처리 진행`);
    
    // 2단계: 각 향수 상세 페이지에서 어코드와 노트 추출
    console.log('2️⃣ 각 향수 상세 페이지에서 어코드와 노트 추출 중...');
    let stopDueTo429 = false;
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0'
    ];
    for (let i = 0; i < maxPerfumes; i++) {
      if (stopDueTo429) break;
      // 중단 체크
      const currentJob = scrapingJobs.get(jobId);
      if (currentJob && currentJob.status === 'cancelled') {
        console.log('🛑 스크래핑 작업이 중단되었습니다.');
        break;
      }
      const link = limitedPerfumeLinks[i];
      console.log(`\n🔄 향수 ${i + 1}/${maxPerfumes} 처리 중: ${link}`);
      // 5~10초 랜덤 딜레이 추가 (429 차단 방지)
      if (i > 0) {
        const delay = 5000 + Math.floor(Math.random() * 5000); // 5~10초
        console.log(`⏳ ${delay / 1000}초 대기 (rate limit 우회)`);
        await new Promise(res => setTimeout(res, delay));
      }
      // 1. DB에 이미 저장된 향수인지 확인(브랜드+이름)
      let alreadyExists = false;
      try {
        // 향수명/브랜드명은 상세 페이지에서 추출해야 정확하지만, URL에서 대략 추출(최적화)
        // 상세 페이지 진입 전에는 브랜드명만으로는 한계가 있으니, 빠르게 상세 진입 후 바로 체크
        // (향수명/브랜드명 추출 최적화 필요시 추가 개선)
        // 여기서는 상세 페이지 진입 전에는 생략하고, 상세 진입 후에만 저장/중복 체크
      } catch (e) { /* 무시 */ }
      try {
        // 2. 향수 상세 페이지에서 어코드와 노트 추출 (최대 3회 재시도, VPN 사용 시 프록시는 끄기)
        const perfumeData = await scraper.scrapePerfumePage(link, 3, userAgents[Math.floor(Math.random() * userAgents.length)], false);
        // 429 감지: perfumeData.brand/name이 비정상적이거나, HTML에 429 메시지 포함 시
        if (
          perfumeData.brand === 'Unknown Brand' &&
          (perfumeData.name === 'www.fragrantica.com' || perfumeData.name.toLowerCase().includes('429'))
        ) {
          console.log('🚨 429 Too Many Requests 감지됨. 스크래핑 즉시 중단!');
          stopDueTo429 = true;
          break;
        }
        // 브랜드 정보 추가
        perfumeData.brand = brandData.brandName;
        console.log(`✅ 향수 데이터 추출 완료: ${perfumeData.name}`);
        console.log(`   - 어코드: ${perfumeData.accord_1_name || '없음'}`);
        console.log(`   - Top Notes: ${Array.isArray(perfumeData.top_notes) ? perfumeData.top_notes.length : 0}개`);
        console.log(`   - Middle Notes: ${Array.isArray(perfumeData.middle_notes) ? perfumeData.middle_notes.length : 0}개`);
        console.log(`   - Base Notes: ${Array.isArray(perfumeData.base_notes) ? perfumeData.base_notes.length : 0}개`);
        // 중복 검사
        const existingPerfume = await Perfume.findOne({
          include: [{
            model: PerfumeBrand,
            as: 'PerfumeBrand',
            where: { name: perfumeData.brand }
          }],
          where: { name: perfumeData.name, status: 1 }
        });
        if (existingPerfume) {
          duplicateCount++;
          results.push({
            ...perfumeData,
            status: 'duplicate',
            existing_perfume: existingPerfume
          });
          console.log(`⚠️ 중복 향수 발견: ${perfumeData.name}`);
        } else if (auto_save) {
          if (batch_save) {
            batchData.push({ ...perfumeData, url: link }); // URL 추가
            results.push({ ...perfumeData, url: link, status: 'pending_batch' });
            console.log(`📦 배치 저장 대기: ${perfumeData.name}`);
          } else {
            if (!brand) {
              brand = await PerfumeBrand.create({ name: perfumeData.brand, status: 1 });
            }
            const savedPerfume = await Perfume.create({
              brand_id: brand.id,
              name: perfumeData.name,
              url: link, // URL 추가
              accord_1_name: perfumeData.accord_1_name,
              accord_1_width: perfumeData.accord_1_width,
              accord_2_name: perfumeData.accord_2_name,
              accord_2_width: perfumeData.accord_2_width,
              accord_3_name: perfumeData.accord_3_name,
              accord_3_width: perfumeData.accord_3_width,
              accord_4_name: perfumeData.accord_4_name,
              accord_4_width: perfumeData.accord_4_width,
              accord_5_name: perfumeData.accord_5_name,
              accord_5_width: perfumeData.accord_5_width,
              top_notes: JSON.stringify(perfumeData.top_notes),
              middle_notes: JSON.stringify(perfumeData.middle_notes),
              base_notes: JSON.stringify(perfumeData.base_notes),
              fragrance_notes: JSON.stringify(perfumeData.fragrance_notes),
              status: 1
            });
            results.push({ ...perfumeData, status: 'saved', saved_perfume: savedPerfume });
            savedCount++;
            console.log(`💾 향수 저장 완료: ${perfumeData.name}`);
          }
        }
      } catch (error) {
        // 429 감지: 에러 메시지에 429 포함 시 즉시 중단 (재시도 후에도 실패한 경우)
        if (error.message && error.message.includes('429')) {
          console.log('🚨 429 Too Many Requests 감지됨(에러). 스크래핑 즉시 중단!');
          stopDueTo429 = true;
          break;
        }
        results.push({ url: link, status: 'failed', error: error.message });
        console.error(`향수 스크래핑 실패 (${link}):`, error);
      }
      // 진행률 업데이트
      const progress = Math.round(((i + 1) / maxPerfumes) * 100);
      scrapingJobs.set(jobId, { 
        status: 'processing', 
        progress,
        results: results.length,
        saved_count: savedCount,
        duplicate_count: duplicateCount,
        batch_data_count: batchData.length
      });
    }
    
    // 배치 저장 실행
    if (batch_save && batchData.length > 0) {
      console.log(`🔄 배치 저장 시작: ${batchData.length}개 향수`);
      
      const { sequelize } = require('../models');
      const transaction = await sequelize.transaction();
      
      try {
        if (!brand) {
          brand = await PerfumeBrand.create({
            name: batchData[0].brand,
            status: 1
          }, { transaction });
        }

        // 배치로 향수 저장
        const savedPerfumes = await Perfume.bulkCreate(
          batchData.map(perfume => ({
            brand_id: brand.id,
            name: perfume.name,
            url: perfume.url, // URL 추가
            accord_1_name: perfume.accord_1_name,
            accord_1_width: perfume.accord_1_width,
            accord_2_name: perfume.accord_2_name,
            accord_2_width: perfume.accord_2_width,
            accord_3_name: perfume.accord_3_name,
            accord_3_width: perfume.accord_3_width,
            accord_4_name: perfume.accord_4_name,
            accord_4_width: perfume.accord_4_width,
            accord_5_name: perfume.accord_5_name,
            accord_5_width: perfume.accord_5_width,
            top_notes: JSON.stringify(perfume.top_notes),
            middle_notes: JSON.stringify(perfume.middle_notes),
            base_notes: JSON.stringify(perfume.base_notes),
            fragrance_notes: JSON.stringify(perfume.fragrance_notes),
            status: 1
          })),
          { transaction }
        );

        await transaction.commit();
        
        savedCount = savedPerfumes.length;
        console.log(`✅ 배치 저장 완료: ${savedCount}개 향수`);
        
        // 결과 업데이트
        results.forEach((result, index) => {
          if (result.status === 'pending_batch') {
            result.status = 'saved';
            result.saved_perfume = savedPerfumes[index];
          }
        });
        
      } catch (error) {
        await transaction.rollback();
        console.error('배치 저장 실패:', error);
        throw error;
      }
    }
    
    await scraper.close();
    
    scrapingJobs.set(jobId, { 
      status: 'completed', 
      progress: 100,
      results,
      saved_count: savedCount,
      duplicate_count: duplicateCount
    });

    res.json({
      success: true,
      job_id: jobId,
      message: `브랜드 스크래핑 완료: ${results.length}개 처리, ${savedCount}개 저장, ${duplicateCount}개 중복`,
      data: {
        brand_name: brandData.brandName,
        total_processed: results.length,
        saved_count: savedCount,
        duplicate_count: duplicateCount,
        failed_count: results.filter(r => r.status === 'failed').length,
        results
      }
    });

  } catch (error) {
    console.error('==== 스크래핑 최상위 에러 발생 ====', error);
    scrapingJobs.set(jobId, { 
      status: 'failed', 
      progress: 0,
      error: error.message
    });

    res.status(500).json({
      success: false,
      job_id: jobId,
      message: '브랜드 스크래핑 중 오류가 발생했습니다.',
      error: error.message
    });
    console.log('==== /api/scrape/brand 종료(에러) ====');
    return;
  }
  console.log('==== /api/scrape/brand 정상 종료 ====');
});

// =====================================================
// 실패한 향수 재시도 스크래핑
// =====================================================
router.post('/retry-failed', async (req, res) => {
  const { job_id, auto_save = false } = req.body;
  
  if (!job_id) {
    return res.status(400).json({
      success: false,
      message: 'job_id는 필수입니다.'
    });
  }

  const originalJob = scrapingJobs.get(job_id);
  if (!originalJob) {
    return res.status(404).json({
      success: false,
      message: '해당 작업을 찾을 수 없습니다.'
    });
  }

  if (originalJob.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: '완료된 작업만 재시도할 수 있습니다.'
    });
  }

  const failedPerfumes = originalJob.results?.filter(r => r.status === 'failed') || [];
  
  if (failedPerfumes.length === 0) {
    return res.json({
      success: true,
      message: '재시도할 실패한 향수가 없습니다.',
      data: {
        total_retried: 0,
        success_count: 0,
        still_failed_count: 0
      }
    });
  }

  const retryJobId = Date.now().toString();
  scrapingJobs.set(retryJobId, { status: 'processing', progress: 0 });

  try {
    console.log(`🔄 실패한 향수 재시도 시작: ${failedPerfumes.length}개`);
    
    const scraper = new FragranticaScraper();
    const results = [];
    let successCount = 0;
    let stillFailedCount = 0;
    
    await scraper.init();
    
    for (let i = 0; i < failedPerfumes.length; i++) {
      const failedPerfume = failedPerfumes[i];
      
      try {
        console.log(`🔄 재시도 중: ${failedPerfume.url}`);
        
        // 타임아웃 시간을 늘려서 재시도
        const perfumeData = await scraper.scrapePerfumePage(failedPerfume.url);
        const finalData = perfumeData;
        
        // 중복 검사
        const existingPerfume = await Perfume.findOne({
          include: [{
            model: PerfumeBrand,
            as: 'PerfumeBrand',
            where: { name: finalData.brand }
          }],
          where: { name: finalData.name, status: 1 }
        });

        if (existingPerfume) {
          results.push({
            ...finalData,
            status: 'duplicate',
            existing_perfume: existingPerfume
          });
        } else if (auto_save) {
          // 브랜드 확인/생성
          let brand = await PerfumeBrand.findOne({
            where: { name: finalData.brand, status: 1 }
          });

          if (!brand) {
            brand = await PerfumeBrand.create({
              name: finalData.brand,
              status: 1
            });
          }

          // 향수 저장
          const savedPerfume = await Perfume.create({
            brand_id: brand.id,
            name: finalData.name,
            accord_1_name: finalData.accord_1_name,
            accord_1_width: finalData.accord_1_width,
            accord_2_name: finalData.accord_2_name,
            accord_2_width: finalData.accord_2_width,
            accord_3_name: finalData.accord_3_name,
            accord_3_width: finalData.accord_3_width,
            accord_4_name: finalData.accord_4_name,
            accord_4_width: finalData.accord_4_width,
            accord_5_name: finalData.accord_5_name,
            accord_5_width: finalData.accord_5_width,
            top_notes: JSON.stringify(finalData.top_notes),
            middle_notes: JSON.stringify(finalData.middle_notes),
            base_notes: JSON.stringify(finalData.base_notes),
            fragrance_notes: JSON.stringify(finalData.fragrance_notes),
            season_tags: finalData.season_tags || [],
            weather_tags: finalData.weather_tags || [],
            analysis_reason: finalData.analysis_reason || null,
            status: 1
          });

          successCount++;
          results.push({
            ...finalData,
            status: 'saved',
            saved_perfume: savedPerfume
          });
        } else {
          successCount++;
          results.push({
            ...finalData,
            status: 'scraped'
          });
        }
        
      } catch (error) {
        console.error(`재시도 실패 (${failedPerfume.url}):`, error);
        stillFailedCount++;
        results.push({
          url: failedPerfume.url,
          status: 'failed',
          error: error.message
        });
      }
      
      // 진행률 업데이트
      const progress = Math.round(((i + 1) / failedPerfumes.length) * 100);
      scrapingJobs.set(retryJobId, { 
        status: 'processing', 
        progress,
        results: results.length,
        success_count: successCount,
        still_failed_count: stillFailedCount
      });
    }
    
    await scraper.close();
    
    scrapingJobs.set(retryJobId, { 
      status: 'completed', 
      progress: 100,
      results,
      success_count: successCount,
      still_failed_count: stillFailedCount
    });

    res.json({
      success: true,
      job_id: retryJobId,
      message: `재시도 완료: ${failedPerfumes.length}개 중 ${successCount}개 성공, ${stillFailedCount}개 여전히 실패`,
      data: {
        total_retried: failedPerfumes.length,
        success_count: successCount,
        still_failed_count: stillFailedCount,
        results
      }
    });

  } catch (error) {
    console.error('재시도 스크래핑 오류:', error);
    
    scrapingJobs.set(retryJobId, { 
      status: 'failed', 
      progress: 0,
      error: error.message
    });

    res.status(500).json({
      success: false,
      job_id: retryJobId,
      message: '재시도 스크래핑 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// =====================================================
// 스크래핑 작업 중단
// =====================================================
router.post('/cancel/:jobId', async (req, res) => {
  const { jobId } = req.params;
  
  const job = scrapingJobs.get(jobId);
  if (!job) {
    return res.status(404).json({
      success: false,
      message: '해당 작업을 찾을 수 없습니다.'
    });
  }

  if (job.status === 'completed' || job.status === 'failed') {
    return res.status(400).json({
      success: false,
      message: '이미 완료되거나 실패한 작업은 중단할 수 없습니다.'
    });
  }

  // 작업 상태를 중단으로 변경
  scrapingJobs.set(jobId, { 
    ...job, 
    status: 'cancelled',
    cancelled_at: new Date().toISOString()
  });

  res.json({
    success: true,
    job_id: jobId,
    message: '스크래핑 작업이 중단되었습니다.',
    data: {
      status: 'cancelled',
      progress: job.progress || 0
    }
  });
});

// =====================================================
// 모든 스크래핑 작업 중단
// =====================================================
router.post('/cancel-all', async (req, res) => {
  let cancelledCount = 0;
  
  for (const [jobId, job] of scrapingJobs.entries()) {
    if (job.status === 'processing') {
      scrapingJobs.set(jobId, { 
        ...job, 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      });
      cancelledCount++;
    }
  }

  res.json({
    success: true,
    message: `${cancelledCount}개의 스크래핑 작업이 중단되었습니다.`,
    data: {
      cancelled_count: cancelledCount
    }
  });
});

// =====================================================
// 스크래핑 작업 상태 조회
// =====================================================
router.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = scrapingJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      message: '작업을 찾을 수 없습니다.'
    });
  }
  
  res.json({
    success: true,
    job_id: jobId,
    ...job
  });
});

// =====================================================
// 스크래핑 작업 목록 조회
// =====================================================
router.get('/jobs', (req, res) => {
  const jobs = Array.from(scrapingJobs.entries()).map(([jobId, job]) => ({
    job_id: jobId,
    ...job
  }));
  
  res.json({
    success: true,
    data: jobs
  });
});

// =====================================================
// 브랜드별 향수 일괄 스크래핑
// =====================================================
router.post('/bulk-perfumes', async (req, res) => {
  const { brands } = req.body;
  
  if (!brands || !Array.isArray(brands) || brands.length === 0) {
    return res.status(400).json({
      success: false,
      message: '브랜드 데이터는 필수입니다.'
    });
  }

  const jobId = Date.now().toString();
  bulkScrapingJobs.set(jobId, { 
    status: 'processing', 
    progress: 0,
    totalProcessed: 0,
    summary: { success: 0, duplicate: 0, failed: 0 }
  });

  // 비동기로 스크래핑 실행
  processBulkScraping(jobId, brands);

  res.json({
    success: true,
    job_id: jobId,
    message: '일괄 스크래핑 작업이 시작되었습니다.'
  });
});

// =====================================================
// 일괄 스크래핑 작업 상태 조회
// =====================================================
router.get('/bulk-status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = bulkScrapingJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      message: '작업을 찾을 수 없습니다.'
    });
  }
  
  res.json({
    success: true,
    job_id: jobId,
    ...job
  });
});

// =====================================================
// 일괄 스크래핑 처리 함수 (개선된 방식)
// =====================================================
async function processBulkScraping(jobId, brands) {
  const scraper = new FragranticaScraper();
  const results = [];
  // 스크래핑 카운터 초기화 (새로운 스크래핑 시작 시마다)
  let totalProcessed = 0;
  let successCount = 0;
  let duplicateCount = 0;
  let failedCount = 0;

  try {
    for (let brandIndex = 0; brandIndex < brands.length; brandIndex++) {
      const brand = brands[brandIndex];
      const { brandName, perfumeLinks } = brand;

      console.log(`🚀 브랜드 처리 시작: ${brandName} (${perfumeLinks.length}개 향수)`);

      // 브랜드 확인/생성
      let brandRecord = await PerfumeBrand.findOne({
        where: { name: brandName, status: 1 }
      });

      if (!brandRecord) {
        brandRecord = await PerfumeBrand.create({
          name: brandName,
          status: 1
        });
        console.log(`✅ 새 브랜드 생성: ${brandName}`);
      }

      // 1단계: URL 중복 체크로 스크래핑 대상 분류
      console.log(`🔍 1단계: URL 중복 체크 및 스크래핑 대상 분류 중...`);
      const scrapingTargets = [];
      
      for (const url of perfumeLinks) {
        const existingPerfume = await Perfume.findOne({
          where: { url: url, status: 1 }
        });

        if (existingPerfume) {
          duplicateCount++;
          results.push({
            url,
            brand: brandName,
            name: existingPerfume.name,
            status: 'duplicate',
            existing_perfume: existingPerfume
          });
          console.log(`⚠️ 중복 향수 (URL): ${existingPerfume.name}`);
        } else {
          scrapingTargets.push(url);
        }
      }

      console.log(`📊 분류 완료: 중복 ${duplicateCount}개, 스크래핑 대상 ${scrapingTargets.length}개`);

      // 2단계: 향수들을 배치 단위로 스크래핑 (Cloudflare/429 방지)
      if (scrapingTargets.length > 0) {
        console.log(`🌐 2단계: ${scrapingTargets.length}개 향수를 배치 단위로 스크래핑 중...`);
        
        // 브라우저 초기화
        await scraper.init();
        
        // 배치 크기/휴식 최적화
        const BATCH_SIZE = Math.floor(Math.random() * 4) + 15; // 15~18개 랜덤 배치
        const BATCH_DELAY_MIN = 8 * 60 * 1000; // 8분 (밀리초) - 안전한 휴식
        const BATCH_DELAY_MAX = 12 * 60 * 1000; // 12분 (밀리초)
        
        for (let i = 0; i < scrapingTargets.length; i++) {
          const url = scrapingTargets[i];
          totalProcessed++;

          try {
            console.log(`🔄 ${i + 1}/${scrapingTargets.length} 향수 스크래핑 중: ${url}`);
            
            // 스크래핑 실행 (브랜드명 전달)
            const perfumeData = await scraper.scrapePerfumePage(url, 3, brandName);
            
            // 향수 저장 (URL 포함)
            // null은 null로, 배열은 배열로 저장 (문자열 'null' 저장 방지)
            function safeStringify(val) {
              if (val === null) return null;
              if (Array.isArray(val)) return JSON.stringify(val);
              return val;
            }
            // 누락 데이터 로깅
            if (
              perfumeData.accord_1_width === null ||
              perfumeData.accord_2_width === null ||
              perfumeData.accord_3_width === null ||
              perfumeData.accord_4_width === null ||
              perfumeData.accord_5_width === null
            ) {
              console.warn(`[누락] accord width null:`, url, perfumeData);
            }
            if (
              (!perfumeData.top_notes || perfumeData.top_notes.length === 0) &&
              (!perfumeData.middle_notes || perfumeData.middle_notes.length === 0) &&
              (!perfumeData.base_notes || perfumeData.base_notes.length === 0) &&
              (!perfumeData.fragrance_notes || perfumeData.fragrance_notes.length === 0)
            ) {
              console.warn(`[누락] notes 모두 없음:`, url, perfumeData);
            }
            const savedPerfume = await Perfume.create({
              brand_id: brandRecord.id,
              name: perfumeData.name,
              url: url,
              accord_1_name: perfumeData.accord_1_name,
              accord_1_width: perfumeData.accord_1_width,
              accord_2_name: perfumeData.accord_2_name,
              accord_2_width: perfumeData.accord_2_width,
              accord_3_name: perfumeData.accord_3_name,
              accord_3_width: perfumeData.accord_3_width,
              accord_4_name: perfumeData.accord_4_name,
              accord_4_width: perfumeData.accord_4_width,
              accord_5_name: perfumeData.accord_5_name,
              accord_5_width: perfumeData.accord_5_width,
              top_notes: safeStringify(perfumeData.top_notes),
              middle_notes: safeStringify(perfumeData.middle_notes),
              base_notes: safeStringify(perfumeData.base_notes),
              fragrance_notes: safeStringify(perfumeData.fragrance_notes),
              status: 1
            });

            successCount++;
            results.push({
              url,
              brand: brandName,
              name: perfumeData.name,
              status: 'saved',
              saved_perfume: savedPerfume
            });
            console.log(`✅ 향수 저장 완료: ${perfumeData.name}`);

          } catch (error) {
            failedCount++;
            results.push({
              url,
              brand: brandName,
              status: 'failed',
              error: error.message
            });
            console.error(`❌ 향수 스크래핑 실패 (${url}):`, error.message);
            
            // 429 에러인 경우 추가 휴식
            if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
              const extraDelay = 10 * 60 * 1000; // 10분 추가 휴식 (15분에서 감소)
              console.log(`🚫 429 에러 감지! ${extraDelay / 60000}분 추가 휴식...`);
              
              bulkScrapingJobs.set(jobId, { 
                status: 'processing', 
                progress,
                totalProcessed,
                summary: { success: successCount, duplicate: duplicateCount, failed: failedCount },
                currentBrand: brandName,
                currentProgress: `${i + 1}/${scrapingTargets.length}`,
                message: `429 에러로 인한 ${extraDelay / 60000}분 추가 휴식 중...`
              });
              
              await new Promise(resolve => setTimeout(resolve, extraDelay));
            }
          }

          // 진행률 업데이트
          const progress = Math.round((totalProcessed / brands.reduce((sum, b) => sum + b.perfumeLinks.length, 0)) * 100);
          bulkScrapingJobs.set(jobId, { 
            status: 'processing', 
            progress,
            totalProcessed,
            summary: { success: successCount, duplicate: duplicateCount, failed: failedCount },
            currentBrand: brandName,
            currentProgress: `${i + 1}/${scrapingTargets.length}`
          });

          // 배치 단위 휴식 로직 (현재 배치에서 실제로 스크래핑한 개수 기준)
          const currentBatchCount = (i + 1) % BATCH_SIZE === 0 ? BATCH_SIZE : (i + 1) % BATCH_SIZE;
          if ((i + 1) % BATCH_SIZE === 0 && i + 1 < scrapingTargets.length) {
            const delay = Math.floor(Math.random() * (BATCH_DELAY_MAX - BATCH_DELAY_MIN + 1)) + BATCH_DELAY_MIN;
            const delayMinutes = Math.round(delay / 60000 * 10) / 10;
            console.log(`⏸️ ${currentBatchCount}개 향수 완료! ${delayMinutes}분 휴식 후 다음 배치 시작...`);
            bulkScrapingJobs.set(jobId, { 
              status: 'processing', 
              progress,
              totalProcessed,
              summary: { success: successCount, duplicate: duplicateCount, failed: failedCount },
              currentBrand: brandName,
              currentProgress: `${i + 1}/${scrapingTargets.length}`,
              message: `${delayMinutes}분 휴식 중...`
            });
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            // 향수별 텀: 3~8초 랜덤
            const randomDelay = Math.floor(Math.random() * 5000) + 3000; // 3-8초
            await new Promise(resolve => setTimeout(resolve, randomDelay));
          }
        }
      }
    }

    // 브라우저는 종료하지 않음 (어드민 페이지가 열려있으므로)
    console.log(`✅ 스크래핑 완료. 브라우저는 유지됩니다.`);
    
    bulkScrapingJobs.set(jobId, { 
      status: 'completed', 
      progress: 100,
      totalProcessed,
      summary: { success: successCount, duplicate: duplicateCount, failed: failedCount },
      results
    });

    console.log(`🎉 일괄 스크래핑 완료: 총 ${totalProcessed}개 처리, 성공 ${successCount}개, 중복 ${duplicateCount}개, 실패 ${failedCount}개`);

  } catch (error) {
    console.error('일괄 스크래핑 오류:', error);
    
    bulkScrapingJobs.set(jobId, { 
      status: 'failed', 
      progress: 0,
      totalProcessed,
      summary: { success: successCount, duplicate: duplicateCount, failed: failedCount },
      error: error.message
    });
  }
}

// 타임스탬프 로그 함수 추가
function logWithTimestamp(...args) {
  const now = new Date().toISOString().replace('T', ' ').replace('Z', '');
  console.log(`[${now}]`, ...args);
}

module.exports = router; 