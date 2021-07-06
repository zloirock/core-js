'use strict';
const Symbol = require('core-js-pure/commonjs/full/symbol');
const Promise = require('core-js-pure/commonjs/full/promise');
const Observable = require('core-js-pure/commonjs/full/observable');

global.Promise = Promise;
global.Symbol = Symbol;
// eslint-disable-next-line import/no-unresolved -- generated later
require('../bundles/observables-tests/default').runTests(Observable);
