import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import createService from '@core-js/polyfill-service';

// warn: a condition is reported once, however many times it is hit - `script-tag` and the adapter
// run on every request, so anything else would print into every response
const reported = [];
const { warn } = createService({ warn: message => reported.push(message) });

strictEqual(warn('csp-hashes-only', 'the page CSP allows no nonce'), true, 'warn #1');
strictEqual(warn('csp-hashes-only', 'the page CSP allows no nonce'), false, 'warn #2');
strictEqual(warn('csp-hashes-only', 'a different message, same condition'), false, 'warn #3');
strictEqual(warn('response-compressed', 'the response arrived compressed'), true, 'warn #4');

deepStrictEqual(reported, [
  '@core-js/polyfill-service: the page CSP allows no nonce',
  '@core-js/polyfill-service: the response arrived compressed',
], 'warn #5');

// two services do not share the record of what has been reported: a test that installs the
// middleware twice would otherwise watch the second one stay silent
const reportedAgain = [];
const second = createService({ warn: message => reportedAgain.push(message) });

strictEqual(second.warn('csp-hashes-only', 'the page CSP allows no nonce'), true, 'warn #6');
strictEqual(reportedAgain.length, 1, 'warn #7');

echo(chalk.green('polyfill service tested'));
