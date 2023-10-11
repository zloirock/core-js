import { timeLimitedPromise } from '../helpers/helpers.js';

import setImmediate from '@core-js/pure/stable/set-immediate';
import clearImmediate from '@core-js/pure/stable/clear-immediate';

QUnit.test('setImmediate / clearImmediate', assert => {
  assert.isFunction(setImmediate, 'setImmediate is function');
  assert.isFunction(clearImmediate, 'clearImmediate is function');
  let called = false;

  const promise = timeLimitedPromise(1e3, resolve => {
    setImmediate(() => {
      called = true;
      resolve();
    });
  }).then(() => {
    assert.required('setImmediate works');
  }, () => {
    assert.avoid('setImmediate works');
  }).then(() => {
    return timeLimitedPromise(1e3, resolve => {
      setImmediate((a, b) => {
        resolve(a + b);
      }, 'a', 'b');
    });
  }).then(it => {
    assert.same(it, 'ab', 'setImmediate works with additional args');
  }, () => {
    assert.avoid('setImmediate works with additional args');
  }).then(() => {
    return timeLimitedPromise(50, resolve => {
      clearImmediate(setImmediate(resolve));
    });
  }).then(() => {
    assert.avoid('clearImmediate works');
  }, () => {
    assert.required('clearImmediate works');
  });

  assert.false(called, 'setImmediate is async');

  return promise;
});
