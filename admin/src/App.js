import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  message,
  Typography,
  Card,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined
} from '@ant-design/icons';
import './App.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const API_BASE_URL = 'http://localhost:8080';

function App() {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPerfume, setEditingPerfume] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPerfumes();
  }, []);

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
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPerfume(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingPerfume(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  // 삭제 기능 비활성화 (테스트 데이터 보호)
  const handleDelete = async (id) => {
    message.warning('테스트 데이터는 삭제할 수 없습니다.');
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingPerfume 
        ? `${API_BASE_URL}/api/perfumes/${editingPerfume.id}`
        : `${API_BASE_URL}/api/perfumes`;
      
      const method = editingPerfume ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('저장에 실패했습니다.');
      }

      message.success(editingPerfume ? '향수가 수정되었습니다.' : '향수가 추가되었습니다.');
      setModalVisible(false);
      fetchPerfumes();
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '브랜드',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: '주요 노트',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => Array.isArray(notes) ? notes.join(', ') : notes,
      ellipsis: true,
    },
    {
      title: '어울리는 계절',
      dataIndex: 'season_tags',
      key: 'season_tags',
      render: (season_tags) => Array.isArray(season_tags) ? season_tags.join(', ') : season_tags,
    },
    {
      title: '어울리는 날씨',
      dataIndex: 'weather_tags',
      key: 'weather_tags',
      render: (weather_tags) => Array.isArray(weather_tags) ? weather_tags.join(', ') : weather_tags,
    },
    {
      title: '분석 이유',
      dataIndex: 'analysis_reason',
      key: 'analysis_reason',
      ellipsis: true,
    },
    {
      title: '작업',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            disabled
            title="수정 비활성화됨"
          >
            수정
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            disabled
            title="삭제 비활성화됨"
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="dark">
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          style={{ height: '100%', borderRight: 0 }}
          theme="dark"
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            대시보드
          </Menu.Item>
          <Menu.Item key="perfumes" icon={<ShoppingOutlined />}>
            향수 관리
          </Menu.Item>
          <Menu.Item key="users" icon={<UserOutlined />}>
            사용자 관리
          </Menu.Item>
        </Menu>
      </Sider>
      
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <Title level={3} style={{ margin: 0, lineHeight: '64px' }}>
            🎭 향수 관리 시스템
          </Title>
        </Header>
        
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="총 향수 수"
                  value={perfumes.length}
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="총 브랜드 수"
                  value={perfumes.length > 0 ? new Set(perfumes.map(p => p.brand)).size : 0}
                  suffix="개"
                />
              </Card>
            </Col>
          </Row>

          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
            >
              향수 추가
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={perfumes}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Content>
      </Layout>

      <Modal
        title={editingPerfume ? '향수 수정' : '향수 추가'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="향수 이름"
            rules={[{ required: true, message: '향수 이름을 입력해주세요!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="brand"
            label="브랜드"
            rules={[{ required: true, message: '브랜드를 입력해주세요!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="주요 노트"
            rules={[{ required: true, message: '주요 노트를 입력해주세요!' }]}
          >
            <Select
              mode="tags"
              placeholder="주요 노트를 입력하세요 (예: 알데하이드, 장미, 자스민)"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="season_tags"
            label="어울리는 계절"
            rules={[{ required: true, message: '어울리는 계절을 선택해주세요!' }]}
          >
            <Select
              mode="multiple"
              placeholder="어울리는 계절을 선택하세요"
              style={{ width: '100%' }}
            >
              <Option value="봄">봄</Option>
              <Option value="여름">여름</Option>
              <Option value="가을">가을</Option>
              <Option value="겨울">겨울</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="weather_tags"
            label="어울리는 날씨"
            rules={[{ required: true, message: '어울리는 날씨를 선택해주세요!' }]}
          >
            <Select
              mode="multiple"
              placeholder="어울리는 날씨를 선택하세요"
              style={{ width: '100%' }}
            >
              <Option value="맑음">맑음</Option>
              <Option value="흐림">흐림</Option>
              <Option value="비">비</Option>
              <Option value="눈">눈</Option>
              <Option value="더움">더움</Option>
              <Option value="추움">추움</Option>
              <Option value="선선함">선선함</Option>
              <Option value="습함">습함</Option>
              <Option value="따뜻함">따뜻함</Option>
              <Option value="쌀쌀함">쌀쌀함</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="analysis_reason"
            label="분석 이유"
            rules={[{ required: true, message: '분석 이유를 입력해주세요!' }]}
          >
            <Input.TextArea rows={4} placeholder="향수의 특징과 분석 이유를 입력하세요" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPerfume ? '수정' : '추가'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                취소
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default App;
