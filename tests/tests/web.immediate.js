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
    assert.ok(true, 'setImmediate works');
  }).catch(() => {
    assert.ok(false, 'setImmediate works');
  }).then(assert.async());
  assert.strictEqual(called, false, 'setImmediate is async');
  timeLimitedPromise(1e3, resolve => {
    setImmediate((a, b) => {
      resolve(a + b);
    }, 'a', 'b');
  }).then(it => {
    assert.strictEqual(it, 'ab', 'setImmediate works with additional args');
  }).catch(() => {
    assert.ok(false, 'setImmediate works with additional args');
  }).then(assert.async());
  timeLimitedPromise(50, resolve => {
    clearImmediate(setImmediate(resolve));
  }).then(() => {
    assert.ok(false, 'clearImmediate works');
  }).catch(() => {
    assert.ok(true, 'clearImmediate works');
  }).then(assert.async());
});
