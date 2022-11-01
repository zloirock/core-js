import { timeLimitedPromise } from '../helpers/helpers';

QUnit.test('setImmediate / clearImmediate', assert => {
  let called = false;
  assert.expect(8);
  assert.isFunction(setImmediate, 'setImmediate is function');
  assert.isFunction(clearImmediate, 'clearImmediate is function');
  assert.name(setImmediate, 'setImmediate');
  assert.name(clearImmediate, 'clearImmediate');

  timeLimitedPromise(1e3, resolve => {
    setImmediate(() => {
      called = true;
      resolve();
    });
  }).then(() => {
    assert.required('setImmediate works');
  }).catch(() => {
    assert.avoid('setImmediate works');
  }).then(assert.async());

  assert.false(called, 'setImmediate is async');

  timeLimitedPromise(1e3, resolve => {
    setImmediate((a, b) => {
      resolve(a + b);
    }, 'a', 'b');
  }).then(it => {
    assert.same(it, 'ab', 'setImmediate works with additional args');
  }).catch(() => {
    assert.avoid('setImmediate works with additional args');
  }).then(assert.async());

  timeLimitedPromise(50, resolve => {
    clearImmediate(setImmediate(resolve));
  }).then(() => {
    assert.avoid('clearImmediate works');
  }).catch(() => {
    assert.required('clearImmediate works');
  }).then(assert.async());
});
