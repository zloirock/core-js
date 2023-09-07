import { NODE } from '../helpers/constants.js';
import { timeLimitedPromise } from '../helpers/helpers.js';

QUnit.test('queueMicrotask', assert => {
  assert.isFunction(queueMicrotask);
  assert.arity(queueMicrotask, 1);
  assert.name(queueMicrotask, 'queueMicrotask');
  if (!NODE) assert.looksNative(queueMicrotask);

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
