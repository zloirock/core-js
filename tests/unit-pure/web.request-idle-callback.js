import { GLOBAL } from '../helpers/constants.js';
import requestIdleCallback from 'core-js-pure/stable/request-idle-callback';
import cancelIdleCallback from 'core-js-pure/stable/cancel-idle-callback';

// setTimeouts have loose limits
// as CI is very slow
QUnit.test('requestIdleCallback', assert => {
  // Mock requestAnimationFrame to be slow so we can
  // test timeouts; this is relevant to our custom implementatino
  // that uses rAF.  If native implementation... don't run the
  // timeout test as it's unreliable to make the environment busy
  const originalRAF = GLOBAL.requestAnimationFrame;
  if (originalRAF) {
    GLOBAL.requestAnimationFrame = callback => {
      return setTimeout(callback, 16);
    };
  }

  assert.isFunction(requestIdleCallback);
  assert.arity(requestIdleCallback, 1);
  assert.name(requestIdleCallback, 'requestIdleCallback');

  const done = assert.async(5);

  let called = false;

  requestIdleCallback(deadline => {
    assert.false(deadline.didTimeout);
    assert.true(deadline.timeRemaining() > 0);
    called = true;
  });

  setTimeout(() => {
    assert.true(called);
    done();
  }, 1000);

  // See comment at top of file.
  if (requestIdleCallback.toString().indexOf('[native code]') === -1) {
    requestIdleCallback(deadline => {
      assert.true(deadline.didTimeout);
      done();
    }, { timeout: 0.000001 });
  } else {
    done();
  }

  assert.isFunction(cancelIdleCallback);
  assert.arity(cancelIdleCallback, 1);
  assert.name(cancelIdleCallback, 'cancelIdleCallback');

  const handle = requestIdleCallback(() => {
    // Shouldn't ever be called.
    assert.true(false);
  });
  cancelIdleCallback(handle);

  // Give the inner "shouldn't ever be called"
  // assert a chance to run and fail.
  setTimeout(() => {
    done();
  }, 1000);

  let ran = false;
  requestIdleCallback(() => {
    ran = true;
  });
  requestIdleCallback(() => {
    // Test that the operation is FIFO.
    assert.true(ran);
    done();
  });

  // Restore mock
  setTimeout(() => {
    GLOBAL.requestAnimationFrame = originalRAF;
    done();
  }, 5000);
});

