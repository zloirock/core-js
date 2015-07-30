require! <[./build fs ./config path]>
module.exports = (grunt)->
  grunt.loadNpmTasks \grunt-contrib-clean
  grunt.loadNpmTasks \grunt-contrib-copy
  grunt.loadNpmTasks \grunt-contrib-uglify
  grunt.loadNpmTasks \grunt-contrib-watch
  grunt.loadNpmTasks \grunt-livescript
  grunt.loadNpmTasks \grunt-karma
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
    livescript: src: files:
      './tests/tests.js': './tests/tests/*'
      './tests/tests-library.js': './tests/tests-library/*'
      './build/index.js': './build/build.ls*'
    clean: ['./library']
    copy: lib: files:
      * expand: on
        cwd: './'
        src: <[es5/** es6/** es7/** js/** web/** core/** fn/** index.js shim.js]>
        dest: './library/'
      * expand: on
        cwd: './'
        src: <[modules/*]>
        dest: './library/'
        filter: \isFile
      * expand: on
        cwd: './modules/library/'
        src: '*'
        dest: './library/modules/'
    watch:
      core:
        files: './modules/*'
        tasks: \default
      tests:
        files: './tests/tests/*'
        tasks: \livescript
    karma:
      unit:
        configFile: './tests/karma.conf.js'
      continuous:
        configFile: './tests/karma.conf.js'
        singleRun: true
        browsers: ['PhantomJS']
  grunt.registerTask \modularize ->
    fs.readdirSync(path.resolve(\modules))
    .filter((filename) -> fs.statSync(path.resolve(\modules, filename)).isFile())
    .filter((filename) ->
      versionOfFile = filename.slice 0 3
      versionOfFile in <[es6 es7]>
    )
    .map((filename) -> filename.slice(0, -3))
    .map((moduleName) ->
      versionOfFile = moduleName.slice 0 3
      grunt.file.mkdir(path.resolve(\client, \modules, versionOfFile, moduleName))
      moduleName
    )
    .map((moduleName) ->
      grunt.task.run [\build-module: + moduleName]
      grunt.task.run [\createPackage: + moduleName]
    )
  grunt.registerTask \createPackage, (moduleName) ->
    versionOfFile = moduleName.slice 0 3
    location = path.resolve(\client, \modules, versionOfFile, moduleName, \package.json)
    version = grunt.config.get('pkg').version
    license = grunt.config.get('pkg').license
    repo = grunt.config.get('pkg').repository.url
    templateData = {
      data: {
        name: moduleName,
        version: version,
        license: license,
        repo: repo,
        main: "#{moduleName}.js"
      }
    }

    template = '''{
      "name": "<%= name %>",
      "description": "Standard library",
      "version": "<%= version %>",
      "repository": {
        "type": "git",
        "url": "<%= repo %>"
      },
      "main": "<%= main %>",
      "license": "<%= license %>"
    }'''

    contents = grunt.template.process(template, templateData)
    grunt.file.write(location, contents)
  grunt.registerTask \build-module, (moduleName) ->
    version = moduleName.slice(0,3)
    grunt.option \path, "./client/modules/#{version}/#{moduleName}/#{moduleName}-umd"
    grunt.task.run ["build:#{moduleName}", "uglify"]
    grunt.task.run ["createPackage:#{moduleName}"]
  grunt.registerTask \build (options)->
    done = @async!
    err, it <- build {
      modules: (options || 'es5,es6,es7,js,web,core')split \,
      blacklist: (grunt.option(\blacklist) || '')split \,
      library: !!grunt.option \library
    }
    if err
      console.error err
      process.exit 1
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
  grunt.registerTask \default <[clean copy client library shim]>
