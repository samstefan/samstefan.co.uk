var app = {
  initialize: function () {
    this.footer()
  }

, footer: function () {
    var $backToBottom = $('.footer__back-to-top')
    $backToBottom.click(function(event) {
      event.preventDefault()
      $('html, body').animate( {scrollTop:(0)}, 'slow')
    })
  }
}

app.initialize()