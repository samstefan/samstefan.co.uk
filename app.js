var express = require('express')
  , bodyParser = require('body-parser')
  , properties = require('./properties')()
  , path = require('path')
  , compress = require('compression')
  , morgan = require('morgan')
  , serveStatic = require('serve-static')

module.exports = function(app, logger, properties, passport, connection) {

  if (properties.env === 'development') {
    // Prettify HTML during development
    app.locals.pretty = true
  }

  app.use(compress({
    filter: function(req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'))
    }
  , level: 9
  }))

  app.set('views', './app/views')
  app.set('view engine', 'jade')
  app.use(serveStatic(path.join(__dirname, 'public')))

  app.use(morgan(':remote-addr :method :url'))

  app.enable('jsonp callback')

  app.use(bodyParser.json())

}