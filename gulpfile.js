var gulp = require('gulp')
  , stylus = require('gulp-stylus')
  , concat = require('gulp-concat')
  , uglify = require('gulp-uglify')

  , nib = require('nib')

  , filePaths =
    { javascript:
      [ './public/js/lib/jquery.js'
      , './public/js/app.js'
      ]
    }

  // Stylus Options
  , stylusOptions =
    { set: ['compress']
    , use: nib()
    }

gulp.task('scripts', function () {
  gulp.src(filePaths.javascript)
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/js/build/'))
})

gulp.task('stylus', function () {
  gulp.src('public/stylus/style.styl')
    .pipe(stylus(stylusOptions))
    .pipe(gulp.dest('public/stylesheets/'))
})

// Watch
gulp.task('watch', function () {
  // Scripts
  gulp.watch('public/js/app.js', ['scripts'])
  // Stylus
  gulp.watch('public/stylus/**/*', ['stylus'])
})

// Default task
gulp.task('default', ['scripts', 'stylus', 'watch' ])

// Build all
gulp.task('build', ['scripts', 'stylus'] )