
exports.up = function (knex, Promise) {
  return knex.schema
    .createTable('photos', (table) => {
      table.increments();
      table.text('filename').notNullable();
      table.text('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at');
    })
};

exports.down = function (knex, Promise) {
  return knex.schema
    .dropTable('photos')
};
