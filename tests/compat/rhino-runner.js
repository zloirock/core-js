require('./tests');
require('./common-runner');
// eslint-disable-next-line import/no-unresolved -- can be created after linting
var data = require('./compat-data');

/* eslint-disable no-restricted-globals -- output */
global.showResults(data, 'rhino', print);
