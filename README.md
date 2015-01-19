# Gulp tooling for web projects

Configurable gulp tooling with sane conventions.

Includes the following:

* browserify + watchify
* browserSync
* coffeescript
* stylus
* sourcemaps
* production builds
* custom server

## Usage

* `npm install --save web-build`
* Create a gulpfile for your project
* Configure and require:

```js
var gulp = require('gulp')
var options = {
  scripts: ['app/app.js', 'server/server.js'],
  styles: ['styles/application.styl'],
  server: {
    path: 'server/server.js',
    port: 3001,
    watch: ['server']
  }
}

require('web-build')(gulp, options)
```

* Use gulp (`gulp watch`, `gulp build`)

## Options

| option | description | default |
|--------|-------------|---------|
| TODO |
