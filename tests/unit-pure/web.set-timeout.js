import { timeLimitedPromise } from '../helpers/helpers.js';

import setTimeout from '@core-js/pure/stable/set-timeout';

QUnit.test('setTimeout / clearTimeout', assert => {
  assert.isFunction(setTimeout, 'setTimeout is function');
  assert.isFunction(clearTimeout, 'clearTimeout is function');

  return timeLimitedPromise(1e3, resolve => {
    setTimeout((a, b) => { resolve(a + b); }, 10, 'a', 'b');
  }).then(it => {
    assert.same(it, 'ab', 'setTimeout works with additional args');
  }, () => {
    assert.avoid('setTimeout works with additional args');
  }).then(() => {
    return timeLimitedPromise(50, resolve => {
      clearTimeout(setTimeout(resolve, 10));
    });
  }).then(() => {
    assert.avoid('clearImmediate works with wrapped setTimeout');
  }, () => {
    assert.required('clearImmediate works with wrapped setTimeout');
  });
});
