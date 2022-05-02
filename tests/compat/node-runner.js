/* eslint-disable no-console -- output */
require('./tests');
require('./common-runner');
var data = require('../../packages/core-js-compat/data');

if (process.argv.indexOf('--mode=JSON') !== -1) {
  console.log(JSON.stringify(global.results, null, '  '));
} else global.showResults(data, 'node', console.log);
