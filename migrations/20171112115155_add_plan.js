
exports.up = function (knex, Promise) {
  return knex.schema
    .table('users', (table) => {
      table.text('plan').defaultTo('free').notNullable();
    })
};

exports.down = function (knex, Promise) {
  return knex.schema
  .table('users', (table) => {
    table.dropColumn('plan');
  })
};
