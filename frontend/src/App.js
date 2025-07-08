import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import './App.css';

// 환경변수에서 API 주소를 읽어오고, 없으면 기본값 사용
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function App() {
  // 인증 상태
  const [auth, setAuth] = useState({ token: localStorage.getItem('token'), username: localStorage.getItem('username') });
  const [authTab, setAuthTab] = useState(0); // 0: 로그인, 1: 회원가입
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // 기존 상태
  const [perfumes, setPerfumes] = useState([]);
  const [filteredPerfumes, setFilteredPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedWeather, setSelectedWeather] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [ownDialogOpen, setOwnDialogOpen] = useState(false);
  const [selectedOwnPerfumeIds, setSelectedOwnPerfumeIds] = useState([]);
  const [ownPerfumeIds, setOwnPerfumeIds] = useState([]);
  const [ownSearchTerm, setOwnSearchTerm] = useState('');
  const [ownBrand, setOwnBrand] = useState('');

  // 인증 관련 함수
  const handleAuthTabChange = (_, newValue) => {
    setAuthTab(newValue);
    setAuthError('');
  };
  const handleAuthInput = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };
  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', authForm.username);
      setAuth({ token: data.token, username: authForm.username });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };
  const handleRegister = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setAuthTab(0);
      setAuthForm({ username: authForm.username, password: '' });
      setAuthError('회원가입 성공! 로그인 해주세요.');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setAuth({ token: null, username: null });
  };

  // 기존 useEffect 등은 로그인 상태에서만 동작
  useEffect(() => {
    if (auth.token) fetchPerfumes();
    // eslint-disable-next-line
  }, [auth.token]);

  useEffect(() => {
    filterPerfumes();
    // eslint-disable-next-line
  }, [perfumes, searchTerm, selectedSeason, selectedWeather]);

  const fetchPerfumes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/perfumes`);
      if (!response.ok) {
        throw new Error('향수 데이터를 불러오는데 실패했습니다.');
      }
      const result = await response.json();
      setPerfumes(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterPerfumes = () => {
    let filtered = [...perfumes];

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(perfume =>
        perfume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perfume.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perfume.notes.some(note => note.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 계절 필터링
    if (selectedSeason) {
      filtered = filtered.filter(perfume =>
        perfume.season_tags.includes(selectedSeason)
      );
    }

    // 날씨 필터링
    if (selectedWeather) {
      filtered = filtered.filter(perfume =>
        perfume.weather_tags.includes(selectedWeather)
      );
    }

    setFilteredPerfumes(filtered);
  };

  const toggleFavorite = (perfumeId) => {
    setFavorites(prev => 
      prev.includes(perfumeId) 
        ? prev.filter(id => id !== perfumeId)
        : [...prev, perfumeId]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSeason('');
    setSelectedWeather('');
  };

  const getSeasonColor = (season) => {
    const colors = {
      '봄': '#FFB6C1',
      '여름': '#87CEEB',
      '가을': '#DDA0DD',
      '겨울': '#F0F8FF'
    };
    return colors[season] || '#E0E0E0';
  };

  // 보유 향수 등록 다이얼로그 열기/닫기
  const openOwnDialog = () => {
    setSelectedOwnPerfumeIds(ownPerfumeIds);
    setOwnDialogOpen(true);
  };
  const closeOwnDialog = () => setOwnDialogOpen(false);

  // 보유 향수 선택 토글
  const handleOwnPerfumeToggle = (id) => {
    setSelectedOwnPerfumeIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // 보유 향수 등록 확정
  const handleOwnPerfumeSave = () => {
    setOwnPerfumeIds(selectedOwnPerfumeIds);
    setOwnDialogOpen(false);
  };

  // 브랜드 리스트 추출
  const brandList = Array.from(new Set(perfumes.map(p => p.brand))).sort();

  // 모달 내 필터링된 리스트 생성
  const filteredOwnPerfumes = perfumes.filter(p => {
    const matchName = p.name.toLowerCase().includes(ownSearchTerm.toLowerCase());
    const matchBrand = ownBrand ? p.brand === ownBrand : true;
    return matchName && matchBrand;
  });

  if (!auth.token) {
    return (
      <Container maxWidth="xs" sx={{ mt: 12 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Tabs value={authTab} onChange={handleAuthTabChange} centered sx={{ mb: 2 }}>
            <Tab label="로그인" />
            <Tab label="회원가입" />
          </Tabs>
          <TextField
            fullWidth
            label="아이디"
            name="username"
            value={authForm.username}
            onChange={handleAuthInput}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="비밀번호"
            name="password"
            type="password"
            value={authForm.password}
            onChange={handleAuthInput}
            sx={{ mb: 2 }}
          />
          {authError && <Alert severity={authError.includes('성공') ? 'success' : 'error'} sx={{ mb: 2 }}>{authError}</Alert>}
          {authTab === 0 ? (
            <Button fullWidth variant="contained" color="primary" onClick={handleLogin} disabled={authLoading}>
              로그인
            </Button>
          ) : (
            <Button fullWidth variant="contained" color="secondary" onClick={handleRegister} disabled={authLoading}>
              회원가입
            </Button>
          )}
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Typography variant="subtitle1" sx={{ mr: 2 }}>{auth.username} 님</Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>로그아웃</Button>
      </Box>
      {/* 헤더 섹션 */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h2" component="h1" gutterBottom color="primary" fontWeight="bold">
          🎭 향수 추천 시스템
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          당신의 취향과 상황에 맞는 완벽한 향수를 찾아보세요
        </Typography>
      </Box>

      {/* 검색 및 필터 섹션 */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="향수명, 브랜드, 노트로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth sx={{ minWidth: 180 }}>
              <InputLabel>계절</InputLabel>
              <Select
                value={selectedSeason}
                label="계절"
                onChange={(e) => setSelectedSeason(e.target.value)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="봄">봄</MenuItem>
                <MenuItem value="여름">여름</MenuItem>
                <MenuItem value="가을">가을</MenuItem>
                <MenuItem value="겨울">겨울</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth sx={{ minWidth: 180 }}>
              <InputLabel>날씨</InputLabel>
              <Select
                value={selectedWeather}
                label="날씨"
                onChange={(e) => setSelectedWeather(e.target.value)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="맑음">맑음</MenuItem>
                <MenuItem value="흐림">흐림</MenuItem>
                <MenuItem value="비">비</MenuItem>
                <MenuItem value="더움">더움</MenuItem>
                <MenuItem value="추움">추움</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              startIcon={<FilterIcon />}
            >
              초기화
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 결과 통계 */}
      <Box mb={3}>
        <Typography variant="h6" color="text.secondary">
          {filteredPerfumes.length}개의 향수를 찾았습니다
        </Typography>
      </Box>

      {/* 향수 카드 그리드 */}
      {filteredPerfumes.length === 0 ? (
        <Alert severity="info">
          검색 조건에 맞는 향수가 없습니다. 다른 조건으로 검색해보세요.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredPerfumes.map((perfume) => (
            <Grid item xs={12} sm={6} md={4} key={perfume.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                    '& .favorite-icon': {
                      opacity: 1
                    }
                  },
                  position: 'relative'
                }}
              >
                {/* 즐겨찾기 버튼 */}
                <IconButton
                  className="favorite-icon"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    opacity: favorites.includes(perfume.id) ? 1 : 0,
                    zIndex: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)'
                    }
                  }}
                  onClick={() => toggleFavorite(perfume.id)}
                >
                  {favorites.includes(perfume.id) ? (
                    <FavoriteIcon color="error" />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>

                <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                  {/* 브랜드 */}
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                    {perfume.brand}
                  </Typography>
                  
                  {/* 향수명 */}
                  <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
                    {perfume.name}
                  </Typography>

                  {/* 주요 노트 */}
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      주요 노트
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {perfume.notes.map((note, index) => (
                        <Chip
                          key={index}
                          label={note}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* 계절 및 날씨 태그 */}
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      어울리는 상황
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {perfume.season_tags.map((season, index) => (
                        <Chip
                          key={index}
                          label={season}
                          size="small"
                          sx={{
                            backgroundColor: getSeasonColor(season),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      ))}
                      {perfume.weather_tags.map((weather, index) => (
                        <Chip
                          key={index}
                          label={weather}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* 분석 이유 */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {perfume.analysis_reason}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 즐겨찾기 섹션 */}
      {favorites.length > 0 && (
        <Box mt={6}>
          <Typography variant="h5" gutterBottom>
            💖 내가 좋아하는 향수 ({favorites.length})
          </Typography>
          <Grid container spacing={2}>
            {perfumes
              .filter(perfume => favorites.includes(perfume.id))
              .map((perfume) => (
                <Grid item xs={12} sm={6} md={3} key={perfume.id}>
                  <Card sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {perfume.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {perfume.brand}
                    </Typography>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}

      {/* 보유 향수 등록 버튼 */}
      <Box mb={4} textAlign="right">
        <Button variant="contained" color="secondary" onClick={openOwnDialog}>
          + 보유 향수 등록
        </Button>
      </Box>

      {/* 내 보유 향수 리스트 */}
      <Box mb={6}>
        <Typography variant="h5" gutterBottom>
          🧴 내 보유 향수 ({ownPerfumeIds.length})
        </Typography>
        {ownPerfumeIds.length === 0 ? (
          <Typography color="text.secondary">아직 등록된 보유 향수가 없습니다.</Typography>
        ) : (
          <Grid container spacing={2}>
            {perfumes.filter(p => ownPerfumeIds.includes(p.id)).map((perfume) => (
              <Grid item xs={12} sm={6} md={4} key={perfume.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">{perfume.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{perfume.brand}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* 보유 향수 등록 다이얼로그 */}
      <Dialog open={ownDialogOpen} onClose={closeOwnDialog} maxWidth="md" fullWidth
        PaperProps={{ sx: { minHeight: 600 } }}>
        <DialogTitle>보유 향수 선택</DialogTitle>
        <DialogContent>
          {/* 검색 영역 */}
          <Box display="flex" gap={2} mb={2}>
            <TextField
              label="이름 검색"
              value={ownSearchTerm}
              onChange={e => setOwnSearchTerm(e.target.value)}
              fullWidth
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>브랜드</InputLabel>
              <Select
                value={ownBrand}
                label="브랜드"
                onChange={e => setOwnBrand(e.target.value)}
              >
                <MenuItem value="">전체</MenuItem>
                {brandList.map(b => (
                  <MenuItem key={b} value={b}>{b}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {/* 필터링된 리스트 */}
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredOwnPerfumes.map((perfume) => (
              <ListItem key={perfume.id} button onClick={() => handleOwnPerfumeToggle(perfume.id)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedOwnPerfumeIds.includes(perfume.id)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText primary={perfume.name} secondary={perfume.brand} />
              </ListItem>
            ))}
            {filteredOwnPerfumes.length === 0 && (
              <ListItem>
                <ListItemText primary="검색 결과가 없습니다." />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeOwnDialog}>취소</Button>
          <Button onClick={handleOwnPerfumeSave} variant="contained">등록</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;
