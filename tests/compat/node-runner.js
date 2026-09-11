'use strict';
/* eslint-disable no-console -- output */
require('./tests');
require('./compat-data');
require('./common-runner');

if (process.argv.includes('json')) {
  console.log(JSON.stringify(global.results, null, '  '));
} else global.showResults('node', console.log);
