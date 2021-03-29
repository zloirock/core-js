import { timeLimitedPromise } from '../helpers/helpers';

import { setTimeout, setInterval } from 'core-js-pure';

QUnit.test('setInterval / clearInterval', assert => {
  assert.expect(1);

  timeLimitedPromise(1e4, (resolve, reject) => {
    let i = 0;
    const interval = setInterval((a, b) => {
      if (a + b !== 'ab' || i > 2) reject({ a, b, i });
      if (i++ === 2) {
        clearInterval(interval);
        setTimeout(resolve, 30);
      }
    }, 5, 'a', 'b');
  }).then(() => {
    assert.ok(true, 'setInterval & clearInterval works with additional args');
  }).catch(error => {
    if (!error) error = {};
    assert.ok(false, `setInterval & clearInterval works with additional args: ${ error.a }, ${ error.b }, times: ${ error.i }`);
  }).then(assert.async());
});
