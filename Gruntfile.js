'use strict';
const build = require('./packages/core-js-builder');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const config = require('./packages/core-js-builder/config');
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
          './packages/core-js/client/core.js.min.js': './packages/core-js/client/core.js',
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
    clean: {
      'core-js': [
        './packages/core-js/client',
        './packages/core-js/LICENSE',
      ],
      'core-js-pure': [
        './packages/core-js-pure/*',
        '!./packages/core-js-pure/override',
        '!./packages/core-js-pure/.npmignore',
        '!./packages/core-js-pure/package.json',
        '!./packages/core-js-pure/README.md',
      ],
      'core-js-builder': [
        './packages/core-js-builder/LICENSE',
      ],
      tests: [
        './tests/bundles/*',
      ],
    },
    copy: {
      'core-js': {
        files: [
          {
            expand: true,
            src: ['LICENSE'],
            dest: './packages/core-js/',
          },
        ],
      },
      'core-js-pure': {
        files: [
          {
            expand: true,
            src: ['LICENSE'],
            dest: './packages/core-js-pure/',
          }, {
            expand: true,
            cwd: './packages/core-js/',
            src: ['internals/**', 'modules/**', 'es/**', 'stage/**', 'web/**', 'features/**', 'index.js'],
            dest: './packages/core-js-pure/',
          }, {
            expand: true,
            cwd: './packages/core-js-pure/override/',
            src: '**',
            dest: './packages/core-js-pure',
          },
        ],
      },
      'core-js-builder': {
        files: [
          {
            expand: true,
            src: ['LICENSE'],
            dest: './packages/core-js-builder/',
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
      tests: {
        files: [
          'packages/core-js/client/core.js',
          'tests/bundles/qunit-helpers.js',
          'tests/bundles/tests.js',
        ].map(it => ({ src: it })),
      },
      pure: {
        files: [
          'tests/bundles/qunit-helpers.js',
          'tests/bundles/pure.js',
        ].map(it => ({ src: it })),
      },
    },
    webpack: require('./.webpack.config.js'),
  });
  grunt.registerTask('bundle', function () {
    const done = this.async();
    build({
      modules: ['es', 'esnext', 'web'],
    }).then(it => {
      const filename = './packages/core-js/client/core.js';
      mkdirp.sync(path.dirname(filename));
      fs.writeFile(filename, it, done);
    }).catch(it => {
      // eslint-disable-next-line no-console
      console.error(it);
      process.exit(1);
    });
  });
};
