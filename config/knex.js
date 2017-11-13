const config = require('./config.js');

const knex = require('knex')({
  client: 'pg',
  connection: config.DATABASE_URL,
  searchPath: 'knex,public',
});

module.exports = knex;
