'use strict';
delete global.Observable;
require('../../');
// eslint-disable-next-line import/no-unresolved
require('../bundles/observables-tests/default').runTests(global.Observable);
