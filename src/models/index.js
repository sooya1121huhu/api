require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// 환경변수 확인 및 Sequelize 인스턴스 생성
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false,
  }
);

// User 모델
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1, comment: '0: 삭제, 1: 활성' }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// PerfumeBrand 모델
const PerfumeBrand = sequelize.define('PerfumeBrand', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0, comment: '0: 삭제, 1: 사용중' }
}, {
  tableName: 'perfumes_brand',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Perfume 모델
const Perfume = sequelize.define('Perfume', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  brand_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  url: { type: DataTypes.TEXT, allowNull: true, unique: true },
  status: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  accord_1_name: { type: DataTypes.STRING(50), allowNull: true },
  accord_1_width: { type: DataTypes.DECIMAL(5,2), allowNull: true },
  accord_2_name: { type: DataTypes.STRING(50), allowNull: true },
  accord_2_width: { type: DataTypes.DECIMAL(5,2), allowNull: true },
  accord_3_name: { type: DataTypes.STRING(50), allowNull: true },
  accord_3_width: { type: DataTypes.DECIMAL(5,2), allowNull: true },
  accord_4_name: { type: DataTypes.STRING(50), allowNull: true },
  accord_4_width: { type: DataTypes.DECIMAL(5,2), allowNull: true },
  accord_5_name: { type: DataTypes.STRING(50), allowNull: true },
  accord_5_width: { type: DataTypes.DECIMAL(5,2), allowNull: true },
  top_notes: { type: DataTypes.TEXT, allowNull: true },
  middle_notes: { type: DataTypes.TEXT, allowNull: true },
  base_notes: { type: DataTypes.TEXT, allowNull: true },
  fragrance_notes: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'perfumes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// UserPerfume 모델
const UserPerfume = sequelize.define('UserPerfume', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  perfume_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1, comment: '0: 삭제, 1: 사용 중, 2: 사용 완료' }
}, {
  tableName: 'user_perfumes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 추천 가중치 테이블 모델
const RecommendWeight = sequelize.define('RecommendWeight', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.STRING(30), allowNull: false },
  sub_type: { type: DataTypes.STRING(30), allowNull: true },
  weight: { type: DataTypes.DECIMAL(4,3), allowNull: false },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
}, {
  tableName: 'recommend_weights',
  timestamps: false
});

// 관계 설정
User.hasMany(UserPerfume, { foreignKey: 'user_id' });
UserPerfume.belongsTo(User, { foreignKey: 'user_id' });

PerfumeBrand.hasMany(Perfume, { foreignKey: 'brand_id' });
Perfume.belongsTo(PerfumeBrand, { foreignKey: 'brand_id' });

Perfume.hasMany(UserPerfume, { foreignKey: 'perfume_id' });
UserPerfume.belongsTo(Perfume, { foreignKey: 'perfume_id' });

module.exports = { sequelize, User, PerfumeBrand, Perfume, UserPerfume, RecommendWeight }; 