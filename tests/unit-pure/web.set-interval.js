import { timeLimitedPromise } from '../helpers/helpers.js';

import setTimeout from '@core-js/pure/stable/set-timeout';
import setInterval from '@core-js/pure/stable/set-interval';

QUnit.test('setInterval / clearInterval', assert => {
  assert.isFunction(setInterval, 'setInterval is function');
  assert.isFunction(clearInterval, 'clearInterval is function');

  return timeLimitedPromise(1e4, (resolve, reject) => {
    let i = 0;
    const interval = setInterval((a, b) => {
      if (a + b !== 'ab' || i > 2) reject({ a, b, i });
      if (i++ === 2) {
        clearInterval(interval);
        setTimeout(resolve, 30);
      }
    }, 5, 'a', 'b');
  }).then(() => {
    assert.required('setInterval & clearInterval works with additional args');
  }, (error = {}) => {
    assert.avoid(`setInterval & clearInterval works with additional args: ${ error.a }, ${ error.b }, times: ${ error.i }`);
  });
});
