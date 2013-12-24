/*
option 'all' => 'enable all modules'
option 'node' => 'enable all modules for node.js'
option 'es5' => 'enable ES5 polyfill'
option 'es6' => 'enable ES6 polyfill'
option 'es6c' => 'enable ES6 collections (Map and Set) polyfill'
option 'timers' => 'enable timers polyfill'
option 'global' => '`global` is one reference for global object on node and browser'
option 'iz' => 'enable iz'
option 'function' => 'enable extend Function and Function.prototype'
option 'object' => 'enable extend Object'
option 'array' => 'enable extend Array and Array.prototype'
option 'number' => 'enable extend Number and Number.prototype'
option 'string' => 'enable extend String.prototype'
option 'regexp' => 'enable extend RegExp and RegExp.prototype'
option 'date' => 'enable extend Date and Date.prototype'
option 'events' => 'enable EventEmitter'
option 'async' => 'enable async'
option 'console' => 'enable console'
*/
require! <[./core-stab ./build fs ./config]>
module.exports = (grunt)->
  require \load-grunt-tasks <| grunt
  grunt.initConfig do
    pkg: grunt.file.readJSON './package.json'
    uglify: build:
      files: './core.min.js': './core.js'
      options:
        mangle: {+sort}
        compress: {+unsafe, +pure_getters}
        sourceMap: './core.min.map'
        banner: config.banner
        report: \gzip
    livescript: src: files: './tests/tests.js': './tests/tests/*'
    watch:
      core:
        files: './src/*'
        tasks: \default
      tests:
        files: './tests/tests/*'
        tasks: \livescript
  grunt.registerTask \build (options = 'all')->
    options .= split \, .reduceTo -> @[it] = on
    done = @async!
    js <- build options
    <- fs.writeFile if options.nodePath => './index.js' else './core.js', js
    done!
  grunt.registerTask \default <[build:all build:node,nodePath uglify]>