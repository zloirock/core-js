import { timeLimitedPromise } from '../helpers/helpers';

QUnit.test('setTimeout / clearTimeout', assert => {
  assert.expect(2);

  timeLimitedPromise(1e3, resolve => {
    setTimeout((a, b) => { resolve(a + b); }, 10, 'a', 'b');
  }).then(it => {
    assert.same(it, 'ab', 'setTimeout works with additional args');
  }).catch(() => {
    assert.avoid('setTimeout works with additional args');
  }).then(assert.async());

  timeLimitedPromise(50, resolve => {
    clearTimeout(setTimeout(resolve, 10));
  }).then(() => {
    assert.avoid('clearImmediate works with wrapped setTimeout');
  }).catch(() => {
    assert.required('clearImmediate works with wrapped setTimeout');
  }).then(assert.async());
});
