/* eslint-disable import/no-dynamic-require -- required for testing */
delete globalThis.Observable;

const pkg = argv.pure ? 'core-js-pure' : 'core-js';

// eslint-disable-next-line import/no-unresolved -- generated later
const { runTests } = require('./bundles/observables-tests/default');

global.Symbol = require(`../../packages/${ pkg }/full/symbol`);
global.Promise = require(`../../packages/${ pkg }/full/promise`);
const Observable = require(`../../packages/${ pkg }/full/observable`);

runTests(Observable);
