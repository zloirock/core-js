'use strict';
const core = require('core-js-pure/full');
global.Promise = core.Promise;
global.Symbol = core.Symbol;
// eslint-disable-next-line import/no-unresolved -- generated later
require('../bundles/observables-tests/default').runTests(core.Observable);
