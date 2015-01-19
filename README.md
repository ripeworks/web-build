# Gulp tooling for building/watching web projects

Using the following:

* browserify + watchify
* browserSync

Features:

* Coffeescript
* Stylus
* Sourcemaps
* Production builds
* Watch with browserSync + custom server

## Usage

* `npm install --save web-build`
* Create a gulpfile for your project
* Configure and require:

```js
require('web-build')({
  scripts: ['app/app.js', 'server/server.js'],
  styles: ['styles/application.styl'],
  server: {
    path: 'server/server.js',
    port: 3001,
    watch: ['server']
  }
})
```

* Use gulp (`gulp watch`, `gulp build`)
