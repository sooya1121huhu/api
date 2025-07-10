// 노트 유사성 매핑 시스템
const noteSimilarityMap = {
  // 시트러스 계열
  '베르가못': ['버가못', 'bergamot'],
  '레몬': ['citron', 'lemon'],
  '라임': ['lime'],
  '오렌지': ['orange', 'sweet orange'],
  
  // 플로럴 계열
  '로즈': ['장미', 'rose', '로즈마리'],
  '재스민': ['jasmine', '자스민'],
  '라벤더': ['lavender'],
  
  // 우디 계열
  '샌달우드': ['sandalwood', '샌달'],
  '시더우드': ['cedarwood', '시더'],
  '파츌리': ['patchouli'],
  
  // 머스크 계열
  '머스크': ['화이트 머스크', 'musk', 'white musk'],
  
  // 바닐라 계열
  '바닐라': ['vanilla'],
  
  // 무화과 계열
  '무화과': ['무화과 잎', 'fig', 'fig leaf'],
  
  // 베티버 계열
  '베티버': ['vetiver', '베티버 루트'],
  
  // 앰버 계열
  '앰버': ['amber', '앰버그리스'],
  
  // 우드 세이지 계열
  '우드 세이지': ['wood sage', 'sage'],
  
  // 해염 계열
  '해염': ['sea salt', 'salt'],
  
  // 알데하이드 계열
  '알데하이드': ['aldehyde'],
  
  // 이리스 계열
  '이리스': ['iris', 'orris root'],
  
  // 타바코 계열
  '타바코': ['tobacco', '담배'],
  
  // 코코아 계열
  '코코아': ['cocoa', '초콜릿'],
  
  // 토닉 계열
  '토닉': ['tonic'],
  
  // 카다멈 계열
  '카다멈': ['cardamom'],
  
  // 바이올렛 계열
  '바이올렛': ['violet'],
  
  // 파인 계열
  '파인': ['pine'],
  
  // 시가 계열
  '시가': ['cigar'],
  
  // 레더 계열
  '레더': ['leather'],
  
  // 코코넛 계열
  '코코넛': ['coconut'],
  
  // 우드 계열
  '우드': ['wood'],
  
  // 앰브록스 계열
  '앰브록스': ['ambroxan', 'ambrox'],
  
  // 럼 계열
  '럼': ['rum'],
  
  // 해양 노트 계열
  '해양 노트': ['marine', 'ocean', 'aquatic'],
  
  // 버가못 계열
  '버가못': ['bergamot', '베르가못'],
  
  // 로즈마리 계열
  '로즈마리': ['rosemary']
};

/**
 * 노트의 유사한 노트들을 찾는 함수
 * @param {string} note - 찾을 노트
 * @returns {string[]} - 유사한 노트들의 배열
 */
function findSimilarNotes(note) {
  const normalizedNote = note.toLowerCase().trim();
  
  // 직접 매칭
  if (noteSimilarityMap[normalizedNote]) {
    return [normalizedNote, ...noteSimilarityMap[normalizedNote]];
  }
  
  // 역방향 매칭 (베르가못 -> 버가못)
  for (const [key, similarNotes] of Object.entries(noteSimilarityMap)) {
    if (similarNotes.includes(normalizedNote)) {
      return [key, ...similarNotes];
    }
  }
  
  // 부분 매칭 (무화과 잎 -> 무화과)
  for (const [key, similarNotes] of Object.entries(noteSimilarityMap)) {
    if (similarNotes.some(similar => 
      normalizedNote.includes(similar) || similar.includes(normalizedNote)
    )) {
      return [key, ...similarNotes];
    }
  }
  
  return [note]; // 매칭되지 않으면 원본 반환
}

/**
 * 두 노트 배열 간의 유사도를 계산하는 함수
 * @param {string[]} notes1 - 첫 번째 노트 배열
 * @param {string[]} notes2 - 두 번째 노트 배열
 * @returns {Object} - 공통 노트와 개수 정보
 */
function calculateNoteSimilarity(notes1, notes2) {
  if (!Array.isArray(notes1) || !Array.isArray(notes2)) {
    return { commonNotes: [], count: 0 };
  }

  // 각 노트를 확장하여 유사한 노트들 포함
  const expandedNotes1 = notes1.flatMap(note => findSimilarNotes(note));
  const expandedNotes2 = notes2.flatMap(note => findSimilarNotes(note));

  // 공통 노트 찾기 (대소문자 무시)
  const commonNotes = expandedNotes1.filter(note1 =>
    expandedNotes2.some(note2 =>
      note1.toLowerCase() === note2.toLowerCase()
    )
  );

  // 1. 소문자로 중복 제거
  const uniqueCommonNotesLower = [...new Set(commonNotes.map(n => n.toLowerCase()))];

  // 2. 원본 노트명으로 복원
  const normalizedNotes = uniqueCommonNotesLower.map(note => {
    for (const [key, similarNotes] of Object.entries(noteSimilarityMap)) {
      if (key === note || similarNotes.includes(note)) {
        return key;
      }
    }
    return note;
  });

  // 3. 최종적으로 한 번 더 중복 제거
  const uniqueNormalizedNotes = [...new Set(normalizedNotes)];

  return {
    commonNotes: uniqueNormalizedNotes,
    count: uniqueNormalizedNotes.length
  };
}

/**
 * 노트 유사성 매핑에 새로운 노트 그룹을 추가하는 함수
 * @param {string} mainNote - 메인 노트명
 * @param {string[]} similarNotes - 유사한 노트들
 */
function addNoteSimilarity(mainNote, similarNotes) {
  noteSimilarityMap[mainNote] = similarNotes;
}

module.exports = {
  findSimilarNotes,
  calculateNoteSimilarity,
  addNoteSimilarity,
  noteSimilarityMap
}; 