
exports.up = function (knex, Promise) {
  return knex.schema
    .createTable('users', (table) => {
      table.text('id').primary();
      table.text('instagram_username');
      table.text('instagram_cookie');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at');
    })
};

exports.down = function (knex, Promise) {
  return knex.schema
    .dropTable('users')
};
