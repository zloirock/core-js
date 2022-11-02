/* eslint-disable import/no-dynamic-require -- dynamic */
delete globalThis.Observable;

const pkg = argv.pure ? 'core-js-pure' : 'core-js';

// eslint-disable-next-line import/no-unresolved -- generated later
const { runTests } = require('./bundles/observables-tests/default');

globalThis.Symbol = require(`../../packages/${ pkg }/full/symbol`);
globalThis.Promise = require(`../../packages/${ pkg }/full/promise`);
const Observable = require(`../../packages/${ pkg }/full/observable`);

runTests(Observable);
