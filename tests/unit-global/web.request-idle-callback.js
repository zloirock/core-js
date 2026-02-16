import { GLOBAL } from '../helpers/constants.js';

QUnit.test('requestIdleCallback', assert => {
  // Mock requestAnimationFrame to be slow so we can
  // test timeouts; this is relevant to our custom implementatino
  // that uses rAF.  If native implementation... don't run the
  // timeout test as it's unreliable to make the environment busy
  const originalRAF = GLOBAL.requestAnimationFrame;
  if (originalRAF) {
    GLOBAL.requestAnimationFrame = (callback) => {
      return setTimeout(callback, 16);
    };
  }

  assert.true(typeof requestIdleCallback == 'function');
  assert.arity(requestIdleCallback, 2);
  assert.name(requestIdleCallback, 'requestIdleCallback');

  const done = assert.async(1);

  let called = false;

  requestIdleCallback(deadline => {
    assert.false(deadline.didTimeout);
    assert.true(typeof deadline.timeRemaining() == 'number');
    called = true;
  });

  setTimeout(() => {
    assert.true(called);
    done();
  }, 20);

  // See comment at top of file.
  // if (GLOBAL.requestIdleCallback.toString().indexOf('[native code]') === -1) {
  //   requestIdleCallback(deadline => {
  //     assert.true(deadline.didTimeout);
  //     done();
  //   }, { timeout: 0.000001 });
  // } else {
  //   done();
  // }


  // assert.true(typeof cancelIdleCallback === 'function');
  // assert.arity(cancelIdleCallback, 1);
  // assert.name(cancelIdleCallback, 'cancelIdleCallback');

  // const handle = requestIdleCallback(() => {
  //   // Shouldn't ever be called.
  //   assert.true(false);
  // });
  // cancelIdleCallback(handle);

  // // Give the inner "shouldn't ever be called"
  // // assert a chance to run and fail.
  // setTimeout(() => {
  //   done();
  // }, 20);

  // let ran = false;
  // requestIdleCallback(() => {
  //   ran = true;
  // });
  // requestIdleCallback(() => {
  //   // Test that the operation is FIFO.
  //   assert.true(ran === true);
  //   done();
  // });

  // // Restore mock
  GLOBAL.requestAnimationFrame = originalRAF;
});
