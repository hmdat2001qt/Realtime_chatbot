// models/Message.js
import { DataTypes } from 'sequelize';
import sequelize from './db.js';
import { User } from './user.model.js';

export const Message = sequelize.define('Message', {
  text: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  senderId: {
    type: DataTypes.INTEGER,
    field: 'sender_id', // Maps to sender_id in the database
  },
  receiverId: {
    type: DataTypes.INTEGER,
    field: 'receiver_id', // Maps to receiver_id in the database
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    get() {
      // Return the date in ISO format
      const date = this.getDataValue('createdAt');
      return date instanceof Date ? date.toISOString() : null;
    }
  }
}, {
  timestamps: false, 
  underscored: true
});

// Associations
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });

Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

