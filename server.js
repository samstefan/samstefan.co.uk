var express = require('express')
  , bunyan = require('bunyan')

  // Load configurations
  , Properties = require('./properties')
  , properties = new Properties()

  // Configure logger
  , logger = bunyan.createLogger({ name: 'samstefan.co.uk' })

// Group options
var options =
  { logger: logger
  , properties: properties
  }

var app = express()

// Express settings
require('./app')(app, logger, properties)

// Bootstrap routes
require(__dirname + '/app/controllers/home')(app, options)

// Catch all other routes
app.get('/', function(req, res){
  res.render('index')
})

app.get('*', function(req, res){
  res.status(404).end()
})

logger.info('Starting samstefan.co.uk on port ' + properties.port)
// Start the app by listening on <port>
app.listen(properties.port)

// Expose server
exports = module.exports = app
