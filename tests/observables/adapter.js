'use strict';
delete global.Observable;
require('core-js/commonjs/full/symbol');
require('core-js/commonjs/full/promise');
require('core-js/commonjs/full/observable');
// eslint-disable-next-line import/no-unresolved -- generated later
require('../bundles/observables-tests/default').runTests(global.Observable);
