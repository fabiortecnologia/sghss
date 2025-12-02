// knexfile.js
import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    client: process.env.DB_CLIENT,
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: 'src/config/migrations'
    },
    seeds: {
      directory: 'src/config/seeds'
    }
  },

  // futuro modo produção com Docker (não precisa agora)
  production: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: 'src/config/migrations'
    },
    seeds: {
      directory: 'src/config/seeds'
    }
  }
};
