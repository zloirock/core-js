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
    <- fs.writeFile grunt.option(\path) || './core.js', js
    done!
  grunt.registerTask \all <[build:all]>
  grunt.registerTask \node ->
    grunt.option \path './index.js'
    grunt.task.run <[build:node]>
  grunt.registerTask \library  ->
    grunt.option \path './library.js'
    grunt.task.run <[build:all,library]>
  grunt.registerTask \default <[all node library uglify]>