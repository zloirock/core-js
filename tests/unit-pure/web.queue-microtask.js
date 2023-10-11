import { timeLimitedPromise } from '../helpers/helpers.js';

import queueMicrotask from '@core-js/pure/full/queue-microtask';

QUnit.test('queueMicrotask', assert => {
  assert.isFunction(queueMicrotask);
  assert.arity(queueMicrotask, 1);

  return timeLimitedPromise(3e3, resolve => {
    let called = false;
    queueMicrotask(() => {
      called = true;
      resolve();
    });
    assert.false(called, 'async');
  }).then(() => {
    assert.required('works');
  });
});
