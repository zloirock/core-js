'use strict';
/* eslint-disable no-console -- output */
require('./tests');
require('./compat-data');
require('./common-runner');

if (process.argv.indexOf('json') !== -1) {
  console.log(JSON.stringify(global.results, null, '  '));
} else global.showResults('node', console.log);
