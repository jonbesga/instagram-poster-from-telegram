const config = require('./config/config');

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: config.DATABASE_NAME,
      user: 'postgres',
      password: 'postgres',
      host: config.DATABASE_HOST,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};
