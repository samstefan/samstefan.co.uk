var Feeds = require('../../lib/feeds')

module.exports = function (app, options) {

  var logger = options.logger
    , feeds = new Feeds (options)

  /*
   * Home Page Templates
   */

  logger.info('Setting up home routes')

  /*
   * Home
   * @route: templates/home
   */

  app.get('/', function(req, res) {
    feeds.get(function (error, feedData) {
      if (error) {
        logger.error(error)
      }

      res.render('index', {
        title: 'Sam Stefan',
        feedData: feedData,
      })
    })
  })

}