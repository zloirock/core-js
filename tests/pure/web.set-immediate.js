import { timeLimitedPromise } from '../helpers/helpers';

import setImmediate from 'core-js-pure/stable/set-immediate';
import clearImmediate from 'core-js-pure/stable/clear-immediate';

QUnit.test('setImmediate / clearImmediate', assert => {
  let called = false;
  assert.expect(6);
  assert.isFunction(setImmediate, 'setImmediate is function');
  assert.isFunction(clearImmediate, 'clearImmediate is function');
  timeLimitedPromise(1e3, res => {
    setImmediate(() => {
      called = true;
      res();
    });
  }).then(() => {
    assert.required('setImmediate works');
  }).catch(() => {
    assert.avoid('setImmediate works');
  }).then(assert.async());
  assert.false(called, 'setImmediate is async');
  timeLimitedPromise(1e3, res => {
    setImmediate((a, b) => {
      res(a + b);
    }, 'a', 'b');
  }).then(it => {
    assert.same(it, 'ab', 'setImmediate works with additional args');
  }).catch(() => {
    assert.avoid('setImmediate works with additional args');
  }).then(assert.async());
  timeLimitedPromise(50, res => {
    clearImmediate(setImmediate(res));
  }).then(() => {
    assert.avoid('clearImmediate works');
  }).catch(() => {
    assert.required('clearImmediate works');
  }).then(assert.async());
});
