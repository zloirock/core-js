import { timeLimitedPromise } from '../helpers/helpers';

import { setTimeout, setInterval } from '../../packages/core-js-pure';

QUnit.test('setTimeout / clearTimeout', assert => {
  assert.expect(2);

  timeLimitedPromise(1e3, res => {
    setTimeout((a, b) => { res(a + b); }, 10, 'a', 'b');
  }).then(it => {
    assert.strictEqual(it, 'ab', 'setTimeout works with additional args');
  }).catch(() => {
    assert.ok(false, 'setTimeout works with additional args');
  }).then(assert.async());

  timeLimitedPromise(50, res => {
    clearTimeout(setTimeout(res, 10));
  }).then(() => {
    assert.ok(false, 'clearImmediate works with wraped setTimeout');
  }).catch(() => {
    assert.ok(true, 'clearImmediate works with wraped setTimeout');
  }).then(assert.async());
});

QUnit.test('setInterval / clearInterval', assert => {
  assert.expect(1);

  timeLimitedPromise(1e4, (res, rej) => {
    let i = 0;
    const interval = setInterval((a, b) => {
      if (a + b !== 'ab' || i > 2) rej({ a, b, i });
      if (i++ === 2) {
        clearInterval(interval);
        setTimeout(res, 30);
      }
    }, 5, 'a', 'b');
  }).then(() => {
    assert.ok(true, 'setInterval & clearInterval works with additional args');
  }).catch(args => {
    if (!args) args = {};
    assert.ok(false, `setInterval & clearInterval works with additional args: ${ args.a }, ${ args.b }, times: ${ args.i }`);
  }).then(assert.async());
});
