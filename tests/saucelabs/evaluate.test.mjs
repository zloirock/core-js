import { deepEqual, equal } from 'node:assert/strict';
import { evaluate } from './evaluate.mjs';

{
  const result = evaluate({
    done: true, failed: 0, total: 2,
    failures: [{ test: 'leaky', message: 'late failure of leaky' }],
  });
  equal(result.passed, false, 'reports an assertion logged after QUnit has finished as a failure #1');
  equal(result.summary, '1 of 2 assertions failed', 'reports an assertion logged after QUnit has finished as a failure #2');
  deepEqual(result.details, ['    leaky: late failure of leaky'], 'reports an assertion logged after QUnit has finished as a failure #3');
}

equal(evaluate({ done: true, failed: 2, total: 10, failures: [] }).passed, false, 'reports regular failures and rejects a page that ran no assertions #1');
deepEqual(evaluate({ done: true, failed: 0, total: 0, failures: [] }), {
  passed: false, summary: 'no assertions ran', details: [],
}, 'reports regular failures and rejects a page that ran no assertions #2');
equal(evaluate({ done: true, failed: 0, total: 10, failures: [] }).passed, true, 'reports regular failures and rejects a page that ran no assertions #3');
