
exports.up = function (knex, Promise) {
  return knex.schema
    .table('users', (table) => {
      table.text('username')
    })
};

exports.down = function (knex, Promise) {
  return knex.schema
  .table('users', (table) => {
    table.dropColumn('username');
  })
};
