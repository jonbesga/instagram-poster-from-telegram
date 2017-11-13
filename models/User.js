const knex = require('../config/knex.js');
const bookshelf = require('bookshelf')(knex);

const model = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
});

module.exports = {

  fetch: id => model.where('id', id).fetch(),

  save: (id, username) => {
    return model.forge({
      id,
      username,
    }).save({}, {
      method: 'insert',
    });
  },

  update: (id, data) => {
    return model.where('id', id).save(data, {patch: true});
  },

  fetchByEmail: email => model.where('email', email).fetch(),
}