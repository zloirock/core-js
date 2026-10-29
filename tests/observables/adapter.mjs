/* eslint-disable import/no-dynamic-require -- dynamic */
delete globalThis.Observable;

const pkg = argv.pure ? 'core-js-pure' : 'core-js';

const { runTests } = require('./bundles/observables-tests/default');

globalThis.Symbol = require(`../../packages/${ pkg }/full/symbol`);
globalThis.Promise = require(`../../packages/${ pkg }/full/promise`);
const Observable = require(`../../packages/${ pkg }/full/observable`);

const runner = await runTests(Observable);
if (runner.logger.failed) throw new Error(`${ runner.logger.failed } Observable conformance assertions failed`);
