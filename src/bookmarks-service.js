const BookmarksService = {
    getAllBookmarks(knex) {
      return knex.select('*').from('bookmarks_cards')
    },

    insertBookmark(knex, newBookmark) {
      return knex
        .insert(newBookmark)
        .into('bookmarks_cards')
        .returning('*')
        .then(rows => rows[0])
    },

    getById(knex, id) {
      return knex.from('bookmarks_cards').select('*').where('id', id).first();
    },
  
    deleteArticle(knex, id) {
      return knex('bookmarks_cards')
        .where('id', id)
        .delete();
    },
  
    updateArticle(knex, id, fields) {
      return knex('bookmarks_cards')
        .where('id', id)
        .update(fields)
        .returning('*')
        .then(rows => rows[0]);
    }
  }
  
  module.exports = BookmarksService