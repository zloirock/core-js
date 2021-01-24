import { timeLimitedPromise } from '../helpers/helpers';

QUnit.test('setTimeout / clearTimeout', assert => {
  assert.expect(2);

  timeLimitedPromise(1e3, resolve => {
    setTimeout((a, b) => { resolve(a + b); }, 10, 'a', 'b');
  }).then(it => {
    assert.strictEqual(it, 'ab', 'setTimeout works with additional args');
  }).catch(() => {
    assert.ok(false, 'setTimeout works with additional args');
  }).then(assert.async());

  timeLimitedPromise(50, resolve => {
    clearTimeout(setTimeout(resolve, 10));
  }).then(() => {
    assert.ok(false, 'clearImmediate works with wraped setTimeout');
  }).catch(() => {
    assert.ok(true, 'clearImmediate works with wraped setTimeout');
  }).then(assert.async());
});
