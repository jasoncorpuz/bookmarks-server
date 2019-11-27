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
    .post(bodyParser, (req, res, next) => {
        //id title rating description
        const { title, url, rating, description = '' } = req.body
        const newBookmark = { title, rating, description, url }

        if (!title) {
            logger.error('Title is required');
            return res
                .status(400)
                .send('Title is required')
        }

        if (!url) {
            logger.error('Url is required');
            return res
                .status(400)
                .send('Url is required')
        }

        if (!rating) {
            logger.error('Rating must be supplied')
            return res
                .status(400)
                .send('Rating must be supplied')
        }
        if (!isWebUri(url)) {
            logger.error('Url is invalid')
            return res
                .status(400)
                .send('Invalid URL')
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

        BookmarksService.insertBookmark(
            req.app.get('db'), newBookmark
        )
            .then(bookmark => {
                res
                    .status(201)
                    .location(`/bookmarks/${bookmark.id}`)
                    .json(serializeBookmark(bookmark))
            })
            .catch(next)
    })

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res, next) => {
        const knex = req.app.get('db')
        const { id } = req.params;
        BookmarksService.getById(knex, id)
            .then(bookmark => {
                if (!bookmark) {
                    logger.error('Bookmark with that id not found')
                    return res.status(404).json({
                        error: { message: `bookmark not found` }
                    })
                } res.json(bookmark)
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        BookmarksService.deleteBookmark(
            req.app.get('db'),
            req.params.id
        )
            .then(bookmark => {
                if (!bookmark) {
                    logger.error('bookmark not found')
                    return res.status(404).send(`bookmark not found`)
                }
            })
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        const { title, description, url, rating } = req.body
        const bookmarkToUpdate = { title, description, url, rating }

        const valuesExist = Object.values(bookmarkToUpdate).filter(Boolean).length
        if (valuesExist === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must have at least title, description, url, or rating.`
                }
            })

        BookmarksService.updateBookmark(
            req.app.get('db'),
            req.params.id,
            bookmarkToUpdate
        )
        .then(bookmark => {
            if (!bookmark) {
                logger.error('bookmark not found')
                return res.status(404).send(`bookmark not found`)
            }
        })

        .then(numRowsAffected => {
            res.status(204).end()
        })
            .catch(next)
    })


module.exports = bookmarkRouter


