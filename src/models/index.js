require('dotenv').config({ path: './config.env' });
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

// Sequelize 인스턴스 생성 (config에서 불러오거나 직접 생성)
const sequelize = config.sequelize || new Sequelize(
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
  password: { type: DataTypes.STRING(255), allowNull: false },
  status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1, comment: '0: 삭제, 1: 활성' }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Perfume 모델
const Perfume = sequelize.define('Perfume', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  brand: { type: DataTypes.STRING(100), allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  url: { type: DataTypes.STRING(500), allowNull: true },
  notes: { type: DataTypes.JSON, allowNull: false },
  season_tags: { type: DataTypes.JSON, allowNull: false },
  weather_tags: { type: DataTypes.JSON, allowNull: false },
  analysis_reason: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }
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

// 관계 설정
User.hasMany(UserPerfume, { foreignKey: 'user_id' });
UserPerfume.belongsTo(User, { foreignKey: 'user_id' });
Perfume.hasMany(UserPerfume, { foreignKey: 'perfume_id' });
UserPerfume.belongsTo(Perfume, { foreignKey: 'perfume_id' });

module.exports = { sequelize, User, Perfume, UserPerfume }; 