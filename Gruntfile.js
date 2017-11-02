'use strict';
const build = require('./build');
const fs = require('fs');
const path = require('path');
const config = require('./build/config');
module.exports = grunt => {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-livescript');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    uglify: {
      build: {
        files: {
          '<%=grunt.option("path")%>.min.js': '<%=grunt.option("path")%>.js'
        },
        options: {
          mangle: {
            keep_fnames: true,
          },
          compress: {
            keep_fnames: true,
            pure_getters: true,
          },
          output: {
            max_line_len: 32000,
          },
          ie8: true,
          sourceMap: true,
          banner: config.banner,
        },
      },
    },
    livescript: {
      src: {
        files: {
          './tests/tests.js': './tests/tests/*',
        },
      },
    },
    clean: ['./library'],
    copy: {
      lib: {
        files: [
          {
            expand: true,
            cwd: './',
            src: ['es/**', 'stage/**', 'web/**', 'core/**', 'fn/**', 'index.js'],
            dest: './library/',
          }, {
            expand: true,
            cwd: './',
            src: ['modules/*'],
            dest: './library/',
            filter: 'isFile',
          }, {
            expand: true,
            cwd: './modules/library/',
            src: '*',
            dest: './library/modules/',
          },
        ],
      },
    },
    watch: {
      core: {
        files: './modules/*',
        tasks: 'default',
      },
      tests: {
        files: './tests/tests/*',
        tasks: 'livescript',
      },
    },
    karma: {
      options: {
        frameworks: ['qunit'],
        basePath: './',
        browsers: ['PhantomJS'],
        singleRun: true,
      },
      default: {
        files: ['client/core.js', 'tests/helpers.js', 'tests/tests.js'].map(it => ({ src: it })),
      },
      library: {
        files: ['client/library.js', 'tests/helpers.js', 'tests/library.js'].map(it => ({ src: it })),
      },
    },
    webpack: {
      options: {
        stats: false,
        output: {
          path: path.resolve(__dirname, 'tests'),
        },
      },
      helpers: {
        entry: './tests/helpers/index.js',
        output: { filename: 'helpers.js' },
      },
      library: {
        entry: './tests/library/index.js',
        output: { filename: 'library.js' },
      },
    },
  });
  grunt.registerTask('build', function (options) {
    const done = this.async();
    return build({
      modules: (options || 'es,esnext,web,core').split(','),
      blacklist: (grunt.option('blacklist') || '').split(','),
      library: !!~['yes', 'on', 'true'].indexOf(grunt.option('library')),
      umd: !~['no', 'off', 'false'].indexOf(grunt.option('umd')),
    }).then(it => {
      grunt.option('path') || grunt.option('path', './custom');
      fs.writeFile(grunt.option('path') + '.js', it, done);
    }).catch(it => {
      console.error(it);
      process.exit(1);
    });
  });
  grunt.registerTask('client', () => {
    grunt.option('library', '');
    grunt.option('path', './client/core');
    return grunt.task.run(['build:es,esnext,web', 'uglify']);
  });
  grunt.registerTask('library', () => {
    grunt.option('library', 'true');
    grunt.option('path', './client/library');
    return grunt.task.run(['build:es,esnext,web,core', 'uglify']);
  });
  return grunt.registerTask('default', ['clean', 'copy', 'client', 'library']);
};
