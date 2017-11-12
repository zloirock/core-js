import { GLOBAL } from '../helpers/constants';
import { timeLimitedPromise } from '../helpers/helpers';

var setImmediate = core.setImmediate;
var clearImmediate = core.clearImmediate;

QUnit.test('setImmediate / clearImmediate', function (assert) {
  var called = false;
  assert.expect(6);
  assert.isFunction(setImmediate, 'setImmediate is function');
  assert.isFunction(clearImmediate, 'clearImmediate is function');
  timeLimitedPromise(1e3, function (res) {
    setImmediate(function () {
      called = true;
      res();
    });
  }).then(function () {
    assert.ok(true, 'setImmediate works');
  })['catch'](function () {
    assert.ok(false, 'setImmediate works');
  }).then(assert.async());
  assert.strictEqual(called, false, 'setImmediate is async');
  timeLimitedPromise(1e3, function (res) {
    setImmediate(function (a, b) {
      res(a + b);
    }, 'a', 'b');
  }).then(function (it) {
    assert.strictEqual(it, 'ab', 'setImmediate works with additional args');
  })['catch'](function () {
    assert.ok(false, 'setImmediate works with additional args');
  }).then(assert.async());
  timeLimitedPromise(50, function (res) {
    clearImmediate(setImmediate(res));
  }).then(function () {
    assert.ok(false, 'clearImmediate works');
  })['catch'](function () {
    assert.ok(true, 'clearImmediate works');
  }).then(assert.async());
});

var now = Date.now || function () {
  return +new Date();
};

function perf() {
  setTimeout(function () {
    var x = 0;
    var time = now();
    function inc() {
      setImmediate(function () {
        x = x + 1;
        if (now() - time < 5e3) {
          inc();
        } else if (GLOBAL.console) {
          // eslint-disable-next-line no-console
          console.log('setImmediate: ' + x / 5 + ' per second');
        }
      });
    }
    inc();
  }, 5e3);
}

if (typeof window != 'undefined' && window !== null) {
  window.onload = perf;
} else {
  perf();
}
