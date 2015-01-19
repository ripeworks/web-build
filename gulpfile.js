'use strict'

var gulp        = require("gulp")
var watchify    = require("watchify")
var browserify  = require("browserify")
var source      = require("vinyl-source-stream")
var browserSync = require("browser-sync")
var gutil       = require("gulp-util")
var nodemon     = require("gulp-nodemon")
var rename      = require("gulp-rename")
var uglify      = require("gulp-uglify")
var sourcemaps  = require("gulp-sourcemaps")
var reload      = browserSync.reload
var path        = require("path")
var assign      = require("object-assign")

var coffeeify   = require("coffeeify")
var stylus      = require("gulp-stylus")
var nib         = require("nib")

var historyApiFallback = require("connect-history-api-fallback")

var config = {
  port: 3000
  // gulp.src of scripts to build
  scripts: ["./app/app.coffee"],
  // gulp.src of styles to build
  styles: ["./styles/application.styl"],
  server: {
    path: "server.coffee",
    port: 4000, // must be different from config.port
    // directories to watch for changes
    watch: ['server']
  },
  paths: {
    dest: 'public',
    scripts: 'js',
    styles: 'css'
  }
}

var watch = false

gulp.task('scripts', function(done) {
  var browserifyConfig = {
    extensions: [".coffee"],
    cache: {},
    packageCache: {},
    fullPaths: true
  }

  var queue = config.scripts.length || 1

  var handleComplete = function() {
    if (!queue) return
    queue--
    if (queue < 1) done()
  }

  var handleError = function(err) {
    gutil.log("Browserify Error:", err.message)
    this.emit('end')
  }

  var bundle = function(script) {
    var b = browserify(script, config)
    if (watch) b = watchify(b)
    var rebundle = function {
      b.bundle()
        .on('error', handleError)
        .pipe(source(path.basename(script)))
        .pipe(rename(extname: ".js"))
        .pipe(gulp.dest(path.join(config.paths.dest, config.paths.scripts)))
        .on('end', handleComplete)
        // .pipe(reload({stream: true}))
    }

    b.on('update', rebundle)
    b.transform(coffeeify)
    rebundle()
  }

  scripts.forEach(bundle)
});

gulp.task('styles', function() {
  gulp.src(config.styles)
    .pipe(sourcemaps.init())
    .pipe(stylus({
      'include css': true,
      use: nib()
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.join(config.paths.dest, config.paths.styles)))
    .pipe(reload({stream: true}))
})

gulp.task('uglify', function(done) {
  if (!watch) return done()
  gulp.src(path.join(config.paths.dest, config.paths.scripts, '**/*.js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.paths.dest))
})

gulp.task('build', ['scripts', 'styles', 'uglify'])

gulp.task('nodemon', function(done) {
  var called = false
  var watchPaths = config.server.path.concat(config.server.watch.map(p) { path.join(p, '**/*.*') })

  nodemon({script: config.server.path, watch: watchPaths})
    .on('start', function() {
      if (!called) done()
      called = true
    })
    .on('restart', function() {
      setTimeout(function() {
        reload({stream: false})
      }, 1000)
    })
})

gulp.task('browser-sync-nodemon', ['nodemon', 'build'], function() {
  browserSync.init({
    files: [path.join(config.paths.dest, '**')],
    proxy: "localhost:" + config.server.port,
    port: config.port,
    open: false,
    watchOptions: {
      debounceDelay: 1000
    }
  })
})

gulp.task('browser-sync', ['build'], function() {
  browserSync({
    files: [path.join(config.paths.dest, '**')],
    port: config.port,
    open: false,
    server: {
      baseDir: [config.paths.dest],
      middleware: [historyApiFallback]
    },
    watchOptions: {
      debounceDelay: 1000
    }
  })
})

gulp.task('set-watch', function() { watch = true })

gulp.task('watch', ['set-watch', config.server ? 'browser-sync-nodemon' : 'browser-sync'], function() {
  gulp.watch('./styles/**/*.*', ['styles'])
})

// gulp.task('production', ['build', 'uglify'])
gulp.task('default', ['watch'])

module.exports = function(c) {
  config = assign(config, c)
}
