import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

async function testSequelizeConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Successfully connected to the MySQL database using Sequelize');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
  }
}

testSequelizeConnection();

export default sequelize;
