
const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarks } = require('./bookmarks.fixtures')

describe('/bookmarks', () => {
    let db;
    
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db',db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean up the table', () => db('bookmarks_cards').truncate())

    afterEach('clean up after each test', () => db('bookmarks_cards').truncate())

    context('give no bookmarks', () => {
        it('responds 200 and an empty list', () => {
            return supertest(app)
             .get('/bookmarks')
             .set('Authorization', `Bearer ${process.env.API_KEY}`)
             .expect(200, [])
        })
    })
    context('Given there are bookmarks in the db', () => {
        const testBookmarks = makeBookmarks()

        beforeEach('insert bookmarks', () => {
            return db   
             .into('bookmarks_cards')
             .insert(testBookmarks)
        })

        it('gets bookmarks from the db', () => {
            return supertest(app)
             .get('/bookmarks')
             .set('Authorization', `Bearer ${process.env.API_KEY}`)
             .expect(200, testBookmarks)

        })
    })

    describe('GET /bookmarks:id', () => {
        context('Given no bookmarks', () => {
            it('responds with 404', () => {
                const id= 1000
                return supertest(app)
                 .get(`/bookmarks/${id}`)
                 .set('Authorization', `Bearer ${process.env.API_KEY}`)
                 .expect(404, {error: {message: `bookmark not found`}})
            })
        })
    })

    context('Given there are bookmarks in the database', () => {
        const testBookmarks = makeBookmarks()    

        beforeEach('insert bookmarks', () => {
            return db.into('bookmarks_cards').insert(testBookmarks)
        })

        it('GET /bookmarks:id responds with 200 and the selected article', () => {
            //define variables before test
            const bookmark = 2
            const expectedBookmark = testBookmarks[bookmark - 1]
            return supertest(app)
                .get(`/bookmarks/${bookmark}`)
                .set('Authorization', `Bearer ${process.env.API_KEY}`)
                .expect(200, expectedBookmark)
    
        })

    })
})

