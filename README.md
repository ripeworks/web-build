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

* `npm install --save-dev web-build gulp`
* Create a gulpfile for your project
* Configure and require:

```js
var gulp = require('gulp')
var options = {
  scripts: ['app/app.js', 'server/server.js'],
  styles: {
    src: ['styles/application.styl'],
    watch: 'styles'
  },
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
| scripts | Array of scripts to compile. | `[]` |
| styles  | Object including `src` array of stylesheets to build and an optional `watch` directory to watch for changes. | `{}` |
| server | Object including `path` string to server script, `port` to listen on, `watch` array of directories to watch for changes. _Port must be different from main port option because a proxy is used with BrowserSync. | `false` |
| port | Port to listen on. | 3000 |
| paths | Object including `dest` string to build destination, `scripts` string to scripts destination, `styles` string to stylesheets destination. | `{dest: 'public', scripts: 'js', styles: 'css'}` |

## Roadmap

* ES6 support
