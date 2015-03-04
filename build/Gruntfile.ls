require! <[./build fs ./config]>
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
  grunt.registerTask \build (options)->
    done = @async!
    <- build (options || 'shim,core').split(\,), (grunt.option(\blacklist) || '').split(\,)
    fs.writeFile (grunt.option(\path) || './custom') + '.js', it, done
  grunt.registerTask \experimental ->
    grunt.option \path './index'
    grunt.task.run <[build:shim.modern,core,exp]>
  grunt.registerTask \client ->
    grunt.option \path './client/core'
    grunt.task.run <[build:shim,core uglify]>
  grunt.registerTask \library ->
    grunt.option \path './client/library'
    grunt.task.run <[build:shim,core,library uglify]>
  grunt.registerTask \shim ->
    grunt.option \path './client/shim'
    grunt.task.run <[build:shim uglify]>
  grunt.registerTask \client-experimental ->
    grunt.option \path './client/core'
    grunt.task.run <[build:shim,core,exp uglify]>
  grunt.registerTask \e <[experimental client-experimental]>
  grunt.registerTask \default <[client library shim]>