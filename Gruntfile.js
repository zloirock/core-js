/* eslint-disable unicorn/filename-case -- 3rd-party tool */
'use strict';
const webpack = require('./.webpack.config.js');

module.exports = grunt => {
  grunt.loadNpmTasks('grunt-webpack');
  grunt.initConfig({
    webpack,
  });
};
