import { STRICT } from '../helpers/constants';

import reverse from 'core-js-pure/full/array/reverse';

QUnit.test('Array#reverse', assert => {
  assert.isFunction(reverse);
  const a = [1, 2.2, 3.3];
  function fn() {
    +a;
    reverse(a);
  }
  fn();
  assert.arrayEqual(a, [3.3, 2.2, 1]);
  if (STRICT) {
    assert.throws(() => reverse(null, () => { /* empty */ }, 1), TypeError);
    assert.throws(() => reverse(undefined, () => { /* empty */ }, 1), TypeError);
  }
});
