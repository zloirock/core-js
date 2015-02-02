require! <[./core-stable ./build fs ./config]>
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
  grunt.registerTask \build (options = 'shim,core')->
    options .= split \, .turn ((memo, it)-> memo[it] = on), {}
    grunt.option(\path) || grunt.option \path './custom'
    done = @async!
    <- build options
    fs.writeFile grunt.option(\path) + '.js', it, done
  grunt.registerTask \node ->
    grunt.option \path './index'
    grunt.task.run <[build:shim.modern,core]>
  grunt.registerTask \library ->
    grunt.option \path './library'
    grunt.task.run <[build:shim.modern,core,library]>
  grunt.registerTask \shim ->
    grunt.option \path './shim'
    grunt.task.run <[build:shim.modern]>
  grunt.registerTask \experimental ->
    grunt.option \path './index'
    grunt.task.run <[build:shim.modern,core,exp]>
  grunt.registerTask \client ->
    grunt.option \path './client/core'
    grunt.task.run <[build:shim,core uglify]>
  grunt.registerTask \client-library ->
    grunt.option \path './client/library'
    grunt.task.run <[build:shim,core,library uglify]>
  grunt.registerTask \client-shim ->
    grunt.option \path './client/shim'
    grunt.task.run <[build:shim uglify]>
  grunt.registerTask \client-experimental ->
    grunt.option \path './client/core'
    grunt.task.run <[build:shim,core,exp uglify]>
  grunt.registerTask \e <[experimental client-experimental]>
  grunt.registerTask \default <[node library shim client client-library client-shim]>