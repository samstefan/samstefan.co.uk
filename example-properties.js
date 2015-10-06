var _ = require('lodash')
  , path = require('path')

  , baseProperties =
    { port: 3010
    , apiKeys:
      { twitter:
        { key: ''
        , secret: ''
        , accessToken: ''
        , accessTokenSecret: ''
        , user: ''
        }
      , tumblr:
        { key: ''
        , blog: ''
        }
      , dribbble:
        { user: ''
        , token: ''
        }
      , instagram:
        { user: ''
        , token: ''
        }
      , github: { user: '' }
      }
    }

  , properties =
    { development: {}
    , testing: {}
  }

module.exports = function () {
  var env = process.env.NODE_ENV || 'development'
  return _.extend({ environment: env }, baseProperties, properties[env])
}