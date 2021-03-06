'use strict'

var watchify    = require("watchify")
var browserify  = require("browserify")
var source      = require("vinyl-source-stream")
var browserSync = require("browser-sync").create()
var gutil       = require("gulp-util")
var nodemon     = require("gulp-nodemon")
var rename      = require("gulp-rename")
var uglify      = require("gulp-uglify")
var minify      = require("gulp-minify-css")
var sourcemaps  = require("gulp-sourcemaps")
var path        = require("path")
var assign      = require("object-assign")

var coffeeify   = require("coffeeify")
var babelify    = require("babelify")
var stylus      = require("gulp-stylus")
var nib         = require("nib")

var historyApiFallback = require("connect-history-api-fallback")

var defaults = {
  port: 3000,
  scripts: [],
  styles: {
    src: [],
    watch: false
  },
  server: false,
  paths: {
    dest: 'public',
    scripts: 'js',
    styles: 'css'
  },
  browserify: {},
  uglify: {},
  minify: {},
  babelify: {},
  coffee: false,
}

var watch = false

module.exports = function(gulp, options) {
  var config = assign(defaults, options)

  gulp.task('scripts', function(done) {
    var browserifyConfig = assign({
      extensions: [".coffee"],
      debug: watch,
      cache: {},
      packageCache: {},
      fullPaths: true
    }, config.browserify);

    var queue = config.scripts.length || 1

    var handleComplete = function() {
      if (!queue) return
      queue--
      if (queue < 1) done()
    }

    var handleError = function(err) {
      gutil.log(err.message)
      browserSync.notify("Browserify Error!")
      this.emit('end')
    }

    var bundle = function(script) {
      var b = browserify(script, browserifyConfig)
      if (watch) b = watchify(b)

      var rebundle = function() {
        return b.bundle()
          .on('error', handleError)
          .pipe(source(path.basename(script)))
          .pipe(rename({extname: ".js"}))
          .pipe(gulp.dest(path.join(config.paths.dest, config.paths.scripts)))
          .on('end', handleComplete)
          .pipe(browserSync.stream({once: true}))
      }

      if (config.coffee) {
        b.transform(coffeeify)
      } else {
        b.transform(babelify.configure(config.babel))
      }
      b.on('update', rebundle)
      config.onBundle && config.onBundle(b)
      return rebundle()
    }

    config.scripts.forEach(bundle)
  });

  gulp.task('styles', function() {
    return gulp.src(config.styles.src)
      .pipe(sourcemaps.init())
      .pipe(stylus({
        'include css': true,
        use: nib()
      }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(path.join(config.paths.dest, config.paths.styles)))
      .pipe(browserSync.stream({once: true}))
  })

  gulp.task('uglify', ['scripts'], function(done) {
    return gulp.src(path.join(config.paths.dest, config.paths.scripts, '**/*.js'))
      .pipe(uglify(config.uglify))
      .pipe(gulp.dest(path.join(config.paths.dest, config.paths.scripts)))
  })

  gulp.task('minify', ['styles'], function(done) {
    return gulp.src(path.join(config.paths.dest, config.paths.styles, '**/*.css'))
      .pipe(minify(config.minify))
      .pipe(gulp.dest(path.join(config.paths.dest, config.paths.styles)))
  })

  gulp.task('nodemon', function(done) {
    var called = false
    var ext = ['js', 'coffee']
    var nodemonConfig = {
      watch: config.server.watch,
      ext: (config.server.extensions ? ext.concat(config.server.extensions) : ext).join(" ")
    }
    if (config.server.path) nodemonConfig.script = config.server.path;

    nodemon(nodemonConfig)
      .on('start', function() {
        if (!called) done()
        called = true
      })
      .on('restart', function() {
        setTimeout(function() {
          reload({stream: false})
        }, config.server.timeout || 2000)
      })
  })

  gulp.task('browser-sync-nodemon', ['nodemon', 'build'], function() {
    browserSync.init({
      open: false,
      port: config.port,
      proxy: "localhost:" + config.server.port,
      watchOptions: {
        debounceDelay: 1000
      }
    })
  })

  gulp.task('browser-sync', ['build'], function() {
    browserSync.init({
      open: false,
      port: config.port,
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
  gulp.task('set-production', function() { process.env.NODE_ENV = 'production' })

  gulp.task('watch', ['set-watch', config.server ? 'browser-sync-nodemon' : 'browser-sync'], function() {
    if (config.styles.watch) {
      gulp.watch(path.join(config.styles.watch, '**/*.{styl,css}'), ['styles'])
    }
  })

  gulp.task('build', ['scripts', 'styles'])
  gulp.task('dist', ['build', 'uglify', 'minify'])
  gulp.task('production', ['set-production', 'dist'])
  gulp.task('default', ['watch'])
}
