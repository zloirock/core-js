'use strict';
const build = require('./build');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const config = require('./build/config');
module.exports = grunt => {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    uglify: {
      build: {
        files: {
          '<%=grunt.option("path")%>.min.js': '<%=grunt.option("path")%>.js',
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
    clean: ['./ponyfill'],
    copy: {
      lib: {
        files: [
          {
            expand: true,
            cwd: './',
            src: ['es/**', 'stage/**', 'web/**', 'fn/**', 'index.js'],
            dest: './ponyfill/',
          }, {
            expand: true,
            cwd: './',
            src: ['modules/*'],
            dest: './ponyfill/',
            filter: 'isFile',
          }, {
            expand: true,
            cwd: './modules/ponyfill/',
            src: '*',
            dest: './ponyfill/modules/',
          },
        ],
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
        files: [
          'client/core.js',
          'tests/bundles/qunit-helpers.js',
          'tests/bundles/tests.js',
        ].map(it => ({ src: it })),
      },
      ponyfill: {
        files: [
          'tests/bundles/qunit-helpers.js',
          'tests/bundles/ponyfill.js',
        ].map(it => ({ src: it })),
      },
    },
    webpack: {
      options: {
        module: {
          loaders: [{
            test: /\.js$/,
            exclude: /modules/,
            loader: 'babel-loader',
            options: {
              // use transforms which does not use es5+ builtins
              plugins: [
                ['transform-es3-member-expression-literals'],
                ['transform-es3-property-literals'],
                // use it instead of webpack es modules for support engines without descriptors
                ['transform-es2015-modules-commonjs', { loose: true }],
                ['transform-es2015-arrow-functions'],
                ['transform-es2015-block-scoped-functions'],
                ['transform-es2015-block-scoping'],
                ['transform-es2015-classes', { loose: true }],
                ['transform-es2015-computed-properties', { loose: true }],
                ['transform-es2015-destructuring', { loose: true }],
                ['transform-es2015-literals'],
                ['transform-es2015-parameters'],
                ['transform-es2015-shorthand-properties'],
                ['transform-es2015-spread', { loose: true }],
                ['transform-es2015-template-literals', { loose: true, spec: true }],
                ['transform-exponentiation-operator'],
                ['transform-for-of-as-array'],
                ['check-es2015-constants'],
              ],
            },
          }],
        },
        node: {
          global: false,
          process: false,
          setImmediate: false,
        },
        stats: false,
        output: {
          path: path.resolve(__dirname, 'tests/bundles'),
        },
      },
      helpers: {
        entry: './tests/helpers/qunit-helpers.js',
        output: { filename: 'qunit-helpers.js' },
      },
      ponyfill: {
        entry: './tests/ponyfill/index.js',
        output: { filename: 'ponyfill.js' },
      },
      tests: {
        entry: './tests/tests/index.js',
        output: { filename: 'tests.js' },
      },
      'promises-aplus-tests': {
        entry: 'promises-aplus-tests/lib/testFiles.js',
        output: { filename: 'promises-aplus.js' },
      },
    },
  });
  grunt.registerTask('build', function (options) {
    const done = this.async();
    return build({
      modules: (options || 'es,esnext,web,core').split(','),
      blacklist: (grunt.option('blacklist') || '').split(','),
      ponyfill: !!~['yes', 'on', 'true'].indexOf(grunt.option('ponyfill')),
      umd: !~['no', 'off', 'false'].indexOf(grunt.option('umd')),
    }).then(it => {
      const filename = `${ grunt.option('path') || './custom' }.js`;
      mkdirp.sync(path.dirname(filename));
      fs.writeFile(filename, it, done);
    }).catch(it => {
      // eslint-disable-next-line no-console
      console.error(it);
      process.exit(1);
    });
  });
  grunt.registerTask('client', () => {
    grunt.option('ponyfill', '');
    grunt.option('path', './client/core');
    return grunt.task.run(['build:es,esnext,web', 'uglify']);
  });
  grunt.registerTask('ponyfill', () => {
    grunt.option('ponyfill', 'true');
    grunt.option('path', './client/ponyfill');
    return grunt.task.run(['build:es,esnext,web,core', 'uglify']);
  });
  return grunt.registerTask('default', ['clean', 'copy', 'client', 'ponyfill']);
};
