const knex = require('../config/knex.js');
const bookshelf = require('bookshelf')(knex);

const model = bookshelf.Model.extend({
  tableName: 'photos',
  hasTimestamps: true,
});

module.exports = {

  fetch: id => model.where('id', id).fetch(),

  save: (user_id, filename) => {
    return model.forge({
      user_id,
      filename,
    }).save({}, {
      method: 'insert',
    });
  },

  getTodayUploads: (user_id) => {
    return model
    .query(function (qb) {
      qb.where('user_id', '=', user_id)
      .andWhere(knex.raw('DATE(created_at) = CURRENT_DATE'))
    })
    .count()
  }
}