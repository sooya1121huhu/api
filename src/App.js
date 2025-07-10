import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Popconfirm,
  Typography,
  Divider,
  List,
  Avatar,
  Switch
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DashboardOutlined,
  GiftOutlined,
  UserOutlined,
  SettingOutlined,
  ShopOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function App() {
  const [perfumes, setPerfumes] = useState([]);
  const [users, setUsers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [editingPerfume, setEditingPerfume] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [form] = Form.useForm();
  const [brandForm] = Form.useForm();
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [stats, setStats] = useState({
    totalPerfumes: 0,
    totalUsers: 0,
    totalBrands: 0,
    recentRecommendations: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [perfumesRes, usersRes, brandsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/perfumes`),
        axios.get(`${API_BASE_URL}/users`),
        axios.get(`${API_BASE_URL}/brands/all`)
      ]);
      
      setPerfumes(perfumesRes.data.data || []);
      setUsers(usersRes.data.data || []);
      setBrands(brandsRes.data.data || []);
      
      setStats({
        totalPerfumes: perfumesRes.data.data?.length || 0,
        totalUsers: usersRes.data.data?.length || 0,
        totalBrands: brandsRes.data.data?.length || 0,
        recentRecommendations: Math.floor(Math.random() * 50) + 10 // 임시 데이터
      });
    } catch (error) {
      message.error('데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPerfume = () => {
    setEditingPerfume(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditPerfume = (perfume) => {
    setEditingPerfume(perfume);
    form.setFieldsValue({
      brand_id: perfume.PerfumeBrand?.id,
      name: perfume.name,
      notes: perfume.notes,
      season_tags: perfume.season_tags,
      weather_tags: perfume.weather_tags,
      analysis_reason: perfume.analysis_reason
    });
    setModalVisible(true);
  };

  const handleDeletePerfume = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/perfumes/${id}`);
      message.success('향수가 삭제되었습니다.');
      fetchData();
    } catch (error) {
      message.error('삭제 실패');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingPerfume) {
        await axios.put(`${API_BASE_URL}/perfumes/${editingPerfume.id}`, values);
        message.success('향수가 수정되었습니다.');
      } else {
        await axios.post(`${API_BASE_URL}/perfumes`, values);
        message.success('향수가 등록되었습니다.');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('저장 실패');
    }
  };

  const handleAddBrand = () => {
    setEditingBrand(null);
    brandForm.resetFields();
    setBrandModalVisible(true);
  };

  const handleEditBrand = (brand) => {
    setEditingBrand(brand);
    brandForm.setFieldsValue({
      name: brand.name,
      status: brand.status === 1
    });
    setBrandModalVisible(true);
  };

  const handleDeleteBrand = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/brands/${id}`);
      message.success('브랜드가 삭제되었습니다.');
      fetchData();
    } catch (error) {
      message.error('삭제 실패');
    }
  };

  const handleBrandSubmit = async (values) => {
    try {
      if (editingBrand) {
        await axios.put(`${API_BASE_URL}/brands/${editingBrand.id}`, {
          name: values.name
        });
        message.success('브랜드가 수정되었습니다.');
      } else {
        await axios.post(`${API_BASE_URL}/brands`, {
          name: values.name
        });
        message.success('브랜드가 등록되었습니다.');
      }
      setBrandModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('저장 실패');
    }
  };

  const handleBrandStatusChange = async (brandId, status) => {
    try {
      await axios.patch(`${API_BASE_URL}/brands/${brandId}/status`, {
        status: status ? 1 : 0
      });
      message.success(`브랜드가 ${status ? '활성화' : '비활성화'}되었습니다.`);
      fetchData();
    } catch (error) {
      message.error('상태 변경 실패');
    }
  };

  const perfumeColumns = [
    {
      title: '브랜드',
      dataIndex: ['PerfumeBrand', 'name'],
      key: 'brand',
      width: 120,
    },
    {
      title: '향수명',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '주요 노트',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => (
        <Space wrap>
          {notes?.slice(0, 3).map((note, index) => (
            <Tag key={index} color="blue">{note}</Tag>
          ))}
          {notes?.length > 3 && <Text type="secondary">+{notes.length - 3}</Text>}
        </Space>
      ),
    },
    {
      title: '계절',
      dataIndex: 'season_tags',
      key: 'season_tags',
      render: (seasons) => (
        <Space wrap>
          {seasons?.map((season, index) => (
            <Tag key={index} color="green">{season}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '날씨',
      dataIndex: 'weather_tags',
      key: 'weather_tags',
      render: (weathers) => (
        <Space wrap>
          {weathers?.map((weather, index) => (
            <Tag key={index} color="orange">{weather}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '활성' : '비활성'}
        </Tag>
      ),
    },
    {
      title: '작업',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditPerfume(record)}
          />
          <Popconfirm
            title="정말 삭제하시겠습니까?"
            onConfirm={() => handleDeletePerfume(record.id)}
            okText="삭제"
            cancelText="취소"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const brandColumns = [
    {
      title: '브랜드명',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Switch
          checked={status === 1}
          onChange={(checked) => handleBrandStatusChange(record.id, checked)}
          checkedChildren="활성"
          unCheckedChildren="비활성"
        />
      ),
    },
    {
      title: '등록일',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: '작업',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditBrand(record)}
          />
          <Popconfirm
            title="정말 삭제하시겠습니까?"
            onConfirm={() => handleDeleteBrand(record.id)}
            okText="삭제"
            cancelText="취소"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const userColumns = [
    {
      title: '사용자명',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '활성' : '비활성'}
        </Tag>
      ),
    },
    {
      title: '가입일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return (
          <div>
            <Title level={2}>📊 대시보드</Title>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="총 향수 수"
                    value={stats.totalPerfumes}
                    prefix={<GiftOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="총 사용자 수"
                    value={stats.totalUsers}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="총 브랜드 수"
                    value={stats.totalBrands}
                    prefix={<ShopOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="최근 추천 수"
                    value={stats.recentRecommendations}
                    prefix={<EyeOutlined />}
                  />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Card title="최근 등록된 향수" style={{ marginBottom: 16 }}>
                  <List
                    dataSource={perfumes.slice(0, 5)}
                    renderItem={(perfume) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar style={{ backgroundColor: '#87d068' }}>{perfume.PerfumeBrand?.name?.charAt(0) || '?'}</Avatar>}
                          title={perfume.name}
                          description={perfume.PerfumeBrand?.name}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="최근 가입한 사용자" style={{ marginBottom: 16 }}>
                  <List
                    dataSource={users.slice(0, 5)}
                    renderItem={(user) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={user.username}
                          description={user.email}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        );
      
      case 'perfumes':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={2}>🎁 향수 관리</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddPerfume}
              >
                향수 등록
              </Button>
            </div>
            <Table
              columns={perfumeColumns}
              dataSource={perfumes}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`,
              }}
            />
          </div>
        );

      case 'brands':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={2}>🏪 브랜드 관리</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddBrand}
              >
                브랜드 등록
              </Button>
            </div>
            <Table
              columns={brandColumns}
              dataSource={brands}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`,
              }}
            />
          </div>
        );
      
      case 'users':
        return (
          <div>
            <Title level={2}>👥 사용자 관리</Title>
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`,
              }}
            />
          </div>
        );
      
      default:
        return <div>페이지를 선택해주세요.</div>;
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '대시보드',
    },
    {
      key: 'perfumes',
      icon: <GiftOutlined />,
      label: '향수 관리',
    },
    {
      key: 'brands',
      icon: <ShopOutlined />,
      label: '브랜드 관리',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '사용자 관리',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '설정',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="dark">
        <div style={{ padding: 16, textAlign: 'center' }}>
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            🎭 향수 관리자
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
        />
      </Sider>
      
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
            <Title level={3} style={{ margin: 0 }}>
              {selectedKey === 'dashboard' && '📊 대시보드'}
              {selectedKey === 'perfumes' && '🎁 향수 관리'}
              {selectedKey === 'brands' && '🏪 브랜드 관리'}
              {selectedKey === 'users' && '👥 사용자 관리'}
              {selectedKey === 'settings' && '⚙️ 설정'}
            </Title>
            <Space>
              <Text>관리자님 환영합니다!</Text>
            </Space>
          </div>
        </Header>
        
        <Content style={{ margin: '24px', padding: '24px', background: '#fff', minHeight: 280 }}>
          {renderContent()}
        </Content>
      </Layout>

      {/* 향수 등록/수정 모달 */}
      <Modal
        title={editingPerfume ? '향수 수정' : '향수 등록'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="brand_id"
                label="브랜드"
                rules={[{ required: true, message: '브랜드를 선택해주세요!' }]}
              >
                <Select placeholder="브랜드를 선택하세요">
                  {brands.filter(brand => brand.status === 1).map(brand => (
                    <Option key={brand.id} value={brand.id}>{brand.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="향수명"
                rules={[{ required: true, message: '향수명을 입력해주세요!' }]}
              >
                <Input placeholder="예: Chanel N°5" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="주요 노트"
            rules={[{ required: true, message: '주요 노트를 입력해주세요!' }]}
          >
            <Select
              mode="tags"
              placeholder="노트를 입력하세요 (예: 로즈, 재스민, 머스크)"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="season_tags"
                label="계절 태그"
                rules={[{ required: true, message: '계절 태그를 입력해주세요!' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="계절을 선택하세요"
                  options={[
                    { value: '봄', label: '봄' },
                    { value: '여름', label: '여름' },
                    { value: '가을', label: '가을' },
                    { value: '겨울', label: '겨울' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="weather_tags"
                label="날씨 태그"
                rules={[{ required: true, message: '날씨 태그를 입력해주세요!' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="날씨를 선택하세요"
                  options={[
                    { value: '맑음', label: '맑음' },
                    { value: '흐림', label: '흐림' },
                    { value: '비', label: '비' },
                    { value: '바람', label: '바람' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="analysis_reason"
            label="분석 및 추천 이유"
            rules={[{ required: true, message: '분석 이유를 입력해주세요!' }]}
          >
            <TextArea
              rows={4}
              placeholder="이 향수의 특징과 추천 이유를 상세히 설명해주세요..."
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                취소
              </Button>
              <Button type="primary" htmlType="submit">
                {editingPerfume ? '수정' : '등록'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 브랜드 등록/수정 모달 */}
      <Modal
        title={editingBrand ? '브랜드 수정' : '브랜드 등록'}
        open={brandModalVisible}
        onCancel={() => setBrandModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={brandForm}
          layout="vertical"
          onFinish={handleBrandSubmit}
        >
          <Form.Item
            name="name"
            label="브랜드명"
            rules={[{ required: true, message: '브랜드명을 입력해주세요!' }]}
          >
            <Input placeholder="예: Chanel" />
          </Form.Item>

          {editingBrand && (
            <Form.Item
              name="status"
              label="상태"
              valuePropName="checked"
            >
              <Switch checkedChildren="활성" unCheckedChildren="비활성" />
            </Form.Item>
          )}

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setBrandModalVisible(false)}>
                취소
              </Button>
              <Button type="primary" htmlType="submit">
                {editingBrand ? '수정' : '등록'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default App; 