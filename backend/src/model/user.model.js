// models/User.js
import { DataTypes } from 'sequelize';
import sequelize from './db.js';

export const User = sequelize.define('User', {
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profile_pic: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'profile_pic',
    defaultValue: 'default.png',
  },
  
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

