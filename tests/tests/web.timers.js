import { timeLimitedPromise } from '../helpers/helpers';

QUnit.test('setTimeout / clearTimeout', function (assert) {
  assert.expect(2);

  timeLimitedPromise(1e3, function (res) {
    setTimeout(function (a, b) { res(a + b); }, 10, 'a', 'b');
  }).then(function (it) {
    assert.strictEqual(it, 'ab', 'setTimeout works with additional args');
  }).catch(function () {
    assert.ok(false, 'setTimeout works with additional args');
  }).then(assert.async());

  timeLimitedPromise(50, function (res) {
    clearTimeout(setTimeout(res, 10));
  }).then(function () {
    assert.ok(false, 'clearImmediate works with wraped setTimeout');
  }).catch(function () {
    assert.ok(true, 'clearImmediate works with wraped setTimeout');
  }).then(assert.async());
});

QUnit.test('setInterval / clearInterval', function (assert) {
  assert.expect(1);

  timeLimitedPromise(1e4, function (res, rej) {
    var i = 0;
    var interval = setInterval(function (a, b) {
      if (a + b !== 'ab' || i > 2) rej({ a: a, b: b, i: i });
      if (i++ === 2) {
        clearInterval(interval);
        setTimeout(res, 30);
      }
    }, 5, 'a', 'b');
  }).then(function () {
    assert.ok(true, 'setInterval & clearInterval works with additional args');
  }).catch(function (args) {
    if (!args) args = {};
    assert.ok(false, 'setInterval & clearInterval works with additional args: ' + args.a + ', ' + args.b + ', times: ' + args.i);
  }).then(assert.async());
});
