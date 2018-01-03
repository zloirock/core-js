'use strict';
delete global.Observable;
require('../../packages/core-js');
// eslint-disable-next-line import/no-unresolved
require('../bundles/observables-tests/default').runTests(global.Observable);
