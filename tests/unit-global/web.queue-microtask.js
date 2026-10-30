import { NODE, DENO } from '../helpers/constants.js';
import { timeLimitedPromise } from '../helpers/helpers.js';

// Deno 1.x implements this API in JavaScript without native-looking source strings.
QUnit.test('queueMicrotask', assert => {
  assert.isFunction(queueMicrotask);
  assert.arity(queueMicrotask, 1);
  assert.name(queueMicrotask, 'queueMicrotask');
  if (!NODE && !DENO) assert.looksNative(queueMicrotask);

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
