var request = require('request')
  , cache = require('memory-cache')
  , Twitter = require('twitter')

module.exports = function(options) {
  var logger = options.logger
    , properties = options.properties
    , connection = options.connection
    , twitterClient = new Twitter(
        { consumer_key: properties.apiKeys.twitter.key
        , consumer_secret: properties.apiKeys.twitter.secret
        , access_token_key: properties.apiKeys.twitter.accessToken
        , access_token_secret: properties.apiKeys.twitter.accessTokenSecret
        }
      )

  /*
   * Blog
   */

  function blog(callback) {
    if (!cache.get('blog')) {
      request.get(properties.apiKeys.blog.url + '/ghost/api/v0.1/public/posts/', function (error, response, data) {
        logger.info('Getting blog posts')
        if (error) {
          logger.error(error)
        } else {
          data = trimBlog(JSON.parse(data))
          cache.put('blog', data, (1000 * 60))
          callback(null, data)
        }
      })
    } else {
      callback(null, cache.get('blog'))
    }
  }

  /*
   * Dirbbble
   */

  function dribble(callback) {
    var baseUrl = 'http://api.dribbble.com/players/'
      , user = properties.apiKeys.dribbble.user

    if (!cache.get('dribble')) {
      request.get( baseUrl + user + '/shots' , function (error, response, data) {
        logger.info('Getting Dribble shots')
        if (error) {
          logger.error(error)
        } else {
          data = trimDribble(JSON.parse(data))
          cache.put('dribble', data, (1000 * 60))
          callback(null, data)
        }
      })
    } else {
      callback(null, cache.get('dribble'))
    }
  }

  /*
   * Instagram
   */

  function instagram(callback) {
    var user = properties.apiKeys.instagram.user
      , baseUrl = 'https://api.instagram.com/v1/users/' + user + '/media/recent/?access_token='
      , token = properties.apiKeys.instagram.token

    if (!cache.get('instagram')) {
      request.get(baseUrl + token, function (error, response, data) {
        logger.info('Getting instagram shots')
        if (error) {
          logger.error(error)
        } else {
          data = trimInstagram(JSON.parse(data))
          cache.put('instagram', data, (1000 * 60))
          callback(null, data)
        }
      })
    } else {
      callback(null, cache.get('instagram'))
    }
  }

  /*
   * Twitter
   */

  function twitter(callback) {
    if (!cache.get('twitter')) {
      twitterClient.get('statuses/user_timeline', function(error, params){
        logger.info('Getting tweets')
        if (error) {
          logger.error(error)
        } else {
          params = trimTwitter(params)
          cache.put('twitter', params, (1000 * 60))
          callback(null, params)
        }
      })
    } else {
      callback(null, cache.get('twitter'))
    }
  }

  /*
   * GitHub
   */

  function github(callback) {
    var user = properties.apiKeys.github.user
      , url = 'https://api.github.com/users/' + user + '/repos'
      , options =
        { url: url
        , headers: { 'User-Agent': 'Request' }
        }

    if (!cache.get('github')) {
      request.get(options, function (error, response, data) {
        logger.info('Getting github projects')
        if (error) {
          logger.error(error)
        } else {
          data = trimGithub(JSON.parse(data))
          cache.put('github', data, (1000 * 60))
          callback(null, data)
        }
      })
    } else {
      callback(null, cache.get('github'))
    }
  }

  /*
   * Trim blog
   */

  function trimBlog(data) {
    var posts = []
    for (var i = 0; i < data.posts.length; i++) {
      if (data.posts[i].status === 'published') {
        var post = {}
        post.date = formatDateTime(data.posts[i].created_at)
        post.title = data.posts[i].title
        post.url = properties.apiKeys.blog.url + data.posts[i].url
        posts.push(post)

        if (post.length === i) {
          return posts
        }
      }
    }

    return posts
  }

  /*
   * Trim Dribbble
   */

  function trimDribble(data) {
    var shots = data.shots
    shots.length = 6

    return shots
  }

  /*
   * Trim Instagram
   */

  function trimInstagram(data) {
    var photos = data.data
      , photoSet = []

    for (var i = 0; i < photos.length; i++) {
      if (photos[i].type === 'image') {
        var photo =
          { link: photos[i].link
          , image: photos[i].images.standard_resolution.url
          , likes: photos[i].likes.count
          , posted: formatDate(photos[i].created_time)
          }

        photoSet.push(photo)
      }
    }

    photoSet.length = 6
    return photoSet
  }

  /*
   * Trim Twitter
   */

  function trimTwitter(tweets) {
    var newTweets = []

    for (var i = 0; i < tweets.length; i++) {
      if (!tweets[i].in_reply_to_screen_name) {
        tweets[i].text = replaceURLWithHTMLLinks(tweets[i].text)
        tweets[i].created_at = formatDateTime(tweets[i].created_at)
        tweets[i].permalink = makeTwitterPermalink(tweets[i])
        newTweets.push(tweets[i])
      }
    }

    newTweets.length = 3
    return newTweets
  }

  /*
   * Trim Github
   */

  function trimGithub(repos) {
    var trimedRepos = []

    // Short repos by stars
    repos.sort(function(a,b){
      if (a.stargazers_count > b.stargazers_count) {
        return 1
      }
      if (a.stargazers_count < b.stargazers_count) {
        return -1
      }
      return 0
    })

    for (var i = repos.length - 1; i >= 0; i--) {
      var repo =
        { stars: repos[i].stargazers_count
        , url: repos[i].html_url
        , name: repos[i].name.charAt(0).toUpperCase() + repos[i].name.slice(1)
        , description: repos[i].description
        }
      trimedRepos.push(repo)
    }

    trimedRepos.length = 4

    return trimedRepos
  }

  /*
   * Make Twitter Permalink
   */

  function makeTwitterPermalink(tweet) {
    return 'https://twitter.com/' + properties.apiKeys.twitter.user + '/status/' + tweet.id_str
  }

  /*
   * Format Date
   */

  function formatDate(timeStamp) {
    var dateObj = new Date(timeStamp * 1000)
    return dateObj.getDate() + '/' + (dateObj.getMonth() + 1) + '/' + dateObj.getFullYear()
  }

  /*
   * Format Date Time
   */

  function formatDateTime(timeStamp) {
    var dateObj = new Date(timeStamp)
      , date = dateObj.getDate() + '/' + (dateObj.getMonth() + 1) + '/' + dateObj.getFullYear()
      , time = dateObj.getHours() + ':' + dateObj.getMinutes()
    return time + ' - ' + date
  }

  /*
   * Replace URL With HTML Links
   */

  function replaceURLWithHTMLLinks(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>')

    // URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>')

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>')

    return replacedText
  }

  return {
    blog: blog,
    dribble: dribble,
    instagram: instagram,
    twitter: twitter,
    github: github
  }

}
