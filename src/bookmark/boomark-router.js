const express = require('express')
const bookmarkRouter = express.Router()
const uuid = require('uuid/v4')
const bodyParser = express.json()
const logger = require('../logger')
// const bookmarks = require('../store') change the store to the database
const { isWebUri } = require('valid-url')
const BookmarksService = require('../bookmarks-service')

//knex accessed through req.app.get('db')


const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description,
    rating: Number(bookmark.rating),
  })

bookmarkRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        const knex = req.app.get('db')
        BookmarksService.getAllBookmarks(knex)
            .then(bkmks => res.json(bkmks))
            .catch(next)
    })
    .post(bodyParser, (req, res) => {
        //id title rating description
        const { title, rating, description = '', url } = req.body

        if (!title) {
            logger.error('Title is required');
            return res
                .status(400)
                .send('Data invalid')
        }

        if (!url) {
            logger.error('Url is required');
            return res
                .status(400)
                .send('Data invalid')
        }

        if (!isWebUri(url)) {
            logger.error('Url is invalid')
            return res
                .status(400)
                .send('Invalid URL')
        }

        if (!rating) {
            logger.error('Rating must be supplied')
            return res
                .status(400)
                .send('Rating must be supplied')
        }

        if (rating.length > 1) {
            logger.error('Invalid rating supplied')
            return res
                .status(400)
                .send('Invalid rating supplied')
        }

        if (rating < 0 || rating > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res
                .status(400)
                .send(`rating must be between 0 and 5`)
        }
        // validate url 
        const id = uuid()

        const bookmark = {
            id,
            title,
            rating,
            description,
            url
        }

        bookmarks.push(bookmark)
        logger.info(`Bookmark ${id} created.`);
        res
            .status(201)
            .location(`http://localhost:8000/card${id}`)
            .json(bookmarks)
    })

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res, next) => {
        const knex = req.app.get('db')
        const { id } = req.params;
        BookmarksService.getById(knex, id)
            .then(bookmark => {
                if(!bookmark){
                    logger.error('Bookmark with that id not found')
                    return res.status(404).json({
                        error: {message: `bookmark not found`}
                    })
                }res.json(bookmark)
            })
        .catch(next)
    })
    .delete((req, res) => {
        const { id } = req.params;
        const bookmarkIdx = bookmarks.findIndex(b => b.id == id);

        if (bookmarkIdx === -1) {
            logger.error(`Bookmark ${id} not found`);
            return res
                .status(404)
                .send('Bookmark not found')
        }

        bookmarks.splice(bookmarkIdx, 1);

        logger.info(`Card with id ${id} deleted.`)

        res
            .status(204)
            .end();
    })

module.exports = bookmarkRouter


