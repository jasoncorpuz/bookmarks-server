function makeBookmarks() {
   return [
        {
            "id": 1,
            "title": "I A TITLE",
            "url": "www.google.com",
            "description": "DEEESCRIPTION",
            "rating": 4
        },
        {
            "id": 2,
            "title": "THE RUMINATIONS OF JEAN VALJEAN",
            "url": "GITHUB.COM",
            "description": "DEEESCRIPTION",
            "rating": 1
        },
        {
            "id": 3,
            "title": "I A boob",
            "url": "www.google.com",
            "description": "DEEESCRIPTION",
            "rating": 2
        },
        {
            "id": 4,
            "title": "I A TITLE",
            "url": "www.google.com",
            "description": "al;sdkjfl;askdfj;",
            "rating": 4
        }
    ]
}

function makeMaliciousBookmark() {
    const maliciousBookmark = {
      id: 911,
      title: 'Naughty naughty very naughty <script>alert("xss");</script>',
      url: 'https://www.hackers.com',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
      rating: 1,
    }
    const expectedBookmark = {
      ...maliciousBookmark,
      title: 'Naughty naughty very naughty <script>alert("xss");</script>',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
      maliciousBookmark,
      expectedBookmark,
    }
  }
  
  module.exports = {
    makeBookmarks,
    makeMaliciousBookmark,
  }