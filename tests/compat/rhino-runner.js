'use strict';
require('./tests');
require('./compat-data');
require('./common-runner');

var GLOBAL = typeof global != 'undefined' ? global : Function('return this')();

/* eslint-disable-next-line no-restricted-globals -- output */
GLOBAL.showResults('rhino', print);
