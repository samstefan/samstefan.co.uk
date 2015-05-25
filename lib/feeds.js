var Cache = require('./cache')
  , async = require('async')

module.exports = function(options) {

  var cache = new Cache(options)

  function getFeeds (callback) {
    async.parallel([
      function (callback) {
        cache.blog(function (error, data) {
          if (error) {
            callback(error)
          } else {
            callback(null, data)
          }
        })
      },
      function (callback) {
        cache.dribble(function (error, data) {
         if (error) {
            callback(error)
          } else {
            callback(null, data)
          }
        })
      },
      function (callback) {
        cache.instagram(function (error, data) {
         if (error) {
            callback(error)
          } else {
            callback(null, data)
          }
        })
      },
      function (callback) {
        cache.twitter(function (error, data) {
         if (error) {
            callback(error)
          } else {
            callback(null, data)
          }
        })
      },
      function (callback) {
        cache.github(function (error, data) {
         if (error) {
            callback(error)
          } else {
            callback(null, data)
          }
        })
      }
    ],
    function(error, results) {
      if (error) {
        callback(error)
      } else {
        // Format results
        var foramttedResults =
          { blog: results[0]
          , dribble: results[1]
          , instagram: results[2]
          , twitter: results[3]
          , github: results[4]
          }

        callback(null, foramttedResults)
      }
    })
  }

  return {
    get: getFeeds
  }

}