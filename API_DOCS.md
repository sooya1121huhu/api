# 향수 상세 페이지 API 문서

## 개요
향수 상세 페이지와 유사 향수 추천 기능을 위한 API 문서입니다.

## API 엔드포인트

### 1. 향수 상세 조회
향수의 상세 정보를 조회합니다.

**URL:** `GET /perfumes/:id`

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "brand": "Kilian",
    "name": "Playing with the Devil",
    "url": "https://example.com/perfume/1",
    "notes": ["베르가못", "핑크 페퍼", "바닐라", "파츌리"],
    "season_tags": ["가을", "겨울"],
    "weather_tags": ["흐림", "비"],
    "analysis_reason": "따뜻하고 스파이시한 향으로 가을과 겨울에 적합합니다.",
    "status": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. 유사 향수 추천
특정 향수와 유사한 향수들을 추천합니다. (2개 이상의 공통 노트가 있는 향수)

**URL:** `GET /perfumes/:id/similar`

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "target_perfume": {
      "id": 1,
      "brand": "Kilian",
      "name": "Playing with the Devil",
      "notes": ["베르가못", "핑크 페퍼", "바닐라", "파츌리"]
    },
    "similar_perfumes": [
      {
        "id": 2,
        "brand": "Tom Ford",
        "name": "Tobacco Vanille",
        "notes": ["바닐라", "토바코", "파츌리", "우드"],
        "common_notes": ["바닐라", "파츌리"],
        "common_notes_count": 2
      }
    ],
    "total_similar_count": 5,
    "returned_count": 1
  }
}
```

## 프론트엔드 구현 가이드

### 1. 페이지 구조
```
향수 상세 페이지
├── 페이지 타이틀 (향수 이름)
├── 주요 정보 카드
│   ├── 브랜드명
│   ├── 주요 노트 (태그 UI)
│   ├── 어울리는 상황 (계절/날씨 태그 UI)
│   └── 분석 이유
└── 유사 향수 추천 섹션
    ├── 섹션 타이틀
    └── 유사 향수 카드 리스트
```

### 2. API 호출 순서
1. `GET /perfumes/:id` - 향수 상세 정보 조회
2. `GET /perfumes/:id/similar` - 유사 향수 추천 조회

### 3. 컴포넌트 구조 제안
```javascript
// PerfumeDetailPage.js
- PerfumeHeader (향수 이름, 브랜드)
- PerfumeInfoCard (노트, 계절, 날씨, 분석 이유)
- SimilarPerfumesSection (유사 향수 리스트)
  - SimilarPerfumeCard (개별 유사 향수 카드)
```

### 4. 상태 관리
```javascript
const [perfume, setPerfume] = useState(null);
const [similarPerfumes, setSimilarPerfumes] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### 5. 라우팅
```javascript
// React Router 예시
<Route path="/perfumes/:id" element={<PerfumeDetailPage />} />
```

## 에러 처리

### 404 에러
- 향수를 찾을 수 없는 경우
- 응답: `{ "success": false, "message": "향수를 찾을 수 없습니다." }`

### 500 에러
- 서버 내부 오류
- 응답: `{ "success": false, "message": "오류 메시지", "error": "상세 오류" }`

## 테스트 방법

1. 서버 실행: `npm start`
2. 테스트 스크립트 실행: `node test_similar_perfumes.js`
3. 브라우저에서 직접 테스트:
   - `GET http://localhost:3000/perfumes/1`
   - `GET http://localhost:3000/perfumes/1/similar` 