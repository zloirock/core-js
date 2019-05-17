/* eslint-disable unicorn/filename-case */
'use strict';
const { banner } = require('./packages/core-js-builder/config');

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = grunt => {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    uglify: {
      build: {
        files: {
          './packages/core-js-bundle/minified.js': './packages/core-js-bundle/index.js',
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
          banner,
        },
      },
    },
    clean: {
      'core-js': [
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
      'core-js-bundle': [
        './packages/core-js-bundle/scripts',
        './packages/core-js-bundle/LICENSE',
      ],
      'core-js-compat': [
        './packages/core-js-compat/data.json',
        './packages/core-js-compat/LICENSE',
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
            src: [
              'es/**',
              'features/**',
              'internals/**',
              'modules/**',
              'proposals/**',
              'scripts/**',
              'stable/**',
              'stage/**',
              'web/**',
              'index.js',
              'configurator.js',
            ],
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
      'core-js-bundle': {
        files: [
          {
            expand: true,
            src: ['LICENSE'],
            dest: './packages/core-js-bundle/',
          }, {
            expand: true,
            cwd: './packages/core-js/',
            src: ['scripts/**'],
            dest: './packages/core-js-bundle/',
          },
        ],
      },
      'core-js-compat': {
        files: [
          {
            expand: true,
            src: ['LICENSE'],
            dest: './packages/core-js-compat/',
          },
        ],
      },
    },
    karma: {
      options: {
        frameworks: ['qunit'],
        basePath: '.',
        browsers: ['HeadlessChrome', 'PhantomJS'],
        customLaunchers: {
          HeadlessChrome: {
            base: 'ChromeHeadless',
            flags: ['--no-sandbox', '--disable-setuid-sandbox'],
          },
        },
        singleRun: true,
      },
      tests: {
        files: [
          'packages/core-js-bundle/index.js',
          'tests/bundles/qunit-helpers.js',
          'tests/bundles/tests.js',
        ].map(src => ({ src })),
      },
      pure: {
        files: [
          'tests/bundles/qunit-helpers.js',
          'tests/bundles/pure.js',
        ].map(src => ({ src })),
      },
    },
    webpack: require('./.webpack.config.js'),
  });
  grunt.registerTask('bundle', function () {
    const builder = require('./packages/core-js-builder');
    const done = this.async();

    builder({ filename: './packages/core-js-bundle/index.js' }).then(done).catch(error => {
      // eslint-disable-next-line no-console
      console.error(error);
      process.exit(1);
    });
  });
};
