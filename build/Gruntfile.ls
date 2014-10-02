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
    options .= split \, .turn ((memo, it)-> memo[it] = on), {}
    grunt.option(\path) || grunt.option \path './core'
    done = @async!
    js <- build options
    fs.writeFile grunt.option(\path) + '.js', js, done
  grunt.registerTask \all <[build:all uglify]>
  grunt.registerTask \node ->
    grunt.option \path './index'
    grunt.task.run <[build:node]>
  grunt.registerTask \library ->
    grunt.option \path './library'
    grunt.task.run <[build:all,library]>
  grunt.registerTask \shim ->
    grunt.option \path './shim'
    grunt.task.run <[build:es5,es6,es6_collections,es6_promise,es6_symbol,es6_iterators,timers,immediate,array_statics,console]>
  grunt.registerTask \default <[all node library]>