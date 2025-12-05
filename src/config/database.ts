import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';

dotenv.config();

// SSL configuration for production (Supabase, Render, etc.)
const isProduction = process.env.NODE_ENV === 'production';
const useSSL = process.env.DB_SSL === 'true' || isProduction;

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'patrimonio_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',

  // Dialect options for SSL and IPv4 forcing
  dialectOptions: {
    ssl: useSSL ? {
      require: true,
      rejectUnauthorized: false, // Supabase uses self-signed certificates
    } : false,
    // Force IPv4 connection (fixes Render deployment with Supabase)
    // Render doesn't support IPv6, but Supabase may return IPv6 addresses
    family: 4,
  },

  models: [], // Will be added after initialization
  logging: process.env.NODE_ENV === 'development' ? console.log : false,

  // Connection pool settings (optimized for serverless/PaaS)
  pool: {
    max: isProduction ? 3 : 5, // Reduce connections in production
    min: 0,
    acquire: 60000, // Increased timeout for serverless cold starts
    idle: 10000,
  },

  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },

  // Retry configuration for unstable connections
  retry: {
    max: 3,
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ENETUNREACH/,
    ],
  },
});

export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

export const syncDatabase = async (force: boolean = false): Promise<void> => {
  try {
    await sequelize.sync({ force, alter: !force && process.env.NODE_ENV === 'development' });
    console.log(`✅ Database synchronized ${force ? '(forced)' : ''}`);
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

export default sequelize;
