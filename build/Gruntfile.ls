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
    <- build {modules: (options || 'es5,es6,es7,js,web,core').split(\,), blacklist: (grunt.option(\blacklist) || '').split(\,), library: !!grunt.option(\library)}
    grunt.option(\path) || grunt.option(\path, './custom')
    fs.writeFile grunt.option(\path) + '.js', it, done
  grunt.registerTask \client ->
    grunt.option \library ''
    grunt.option \path './client/core'
    grunt.task.run <[build:es5,es6,es7,js,web,core uglify]>
  grunt.registerTask \library ->
    grunt.option \library 'true'
    grunt.option \path './client/library'
    grunt.task.run <[build:es5,es6,es7,js,web,core uglify]>
  grunt.registerTask \shim ->
    grunt.option \library ''
    grunt.option \path './client/shim'
    grunt.task.run <[build:es5,es6,es7,js,web uglify]>
  grunt.registerTask \e ->
    grunt.option \library ''>
    grunt.option \path './client/core'
    grunt.task.run <[build:es5,es6,es7,js,web,core,exp uglify]>
  grunt.registerTask \default <[client library shim]>