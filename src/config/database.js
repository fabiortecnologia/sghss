import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const db = knex({
  client: process.env.DB_CLIENT || 'pg',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5433,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234567890',
    database: process.env.DB_NAME || 'sghss'
  }
});

export default db;
