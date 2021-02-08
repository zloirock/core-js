/* eslint-disable unicorn/filename-case -- 3rd-party tool */
'use strict';
const webpack = require('./.webpack.config.js');

module.exports = grunt => {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.initConfig({
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
              'stable/**',
              'stage/**',
              'web/**',
              'index.js',
              'configurator.js',
              'postinstall.js',
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
            src: ['postinstall.js'],
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
    webpack,
  });
};
