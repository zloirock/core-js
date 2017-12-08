'use strict';
const core = require('../../library');
global.Promise = core.Promise;
global.Symbol = core.Symbol;
// eslint-disable-next-line import/no-unresolved
require('../bundles/observables-tests/default').runTests(core.Observable);
