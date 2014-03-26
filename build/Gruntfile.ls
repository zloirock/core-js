require! <[./core-stab ./build fs ./config]>
module.exports = (grunt)->
  require \load-grunt-tasks <| grunt
  grunt.initConfig do
    pkg: grunt.file.readJSON './package.json'
    uglify: build:
      files: '<%=grunt.option("path")%>.min.js': '<%=grunt.option("path")%>.js'
      options:
        mangle: {+sort}
        compress: {+unsafe, +pure_getters}
        sourceMap: '<%=grunt.option("path")%>.min.map'
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
    <- fs.writeFile (grunt.option(\path) || './core') + '.js', js
    done!
  grunt.registerTask \all ->
    grunt.option \path './core'
    grunt.task.run <[build:all]>
  grunt.registerTask \node ->
    grunt.option \path './index'
    grunt.task.run <[build:node]>
  grunt.registerTask \library ->
    grunt.option \path './library'
    grunt.task.run <[build:all,library]>
  grunt.registerTask \shim <[build:es5,es6,es6c,promise,symbol,reflect,iterator,timers,immediate,console]>
  grunt.registerTask \default <[node library all uglify]>