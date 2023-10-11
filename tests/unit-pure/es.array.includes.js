import { STRICT } from '../helpers/constants.js';

import includes from '@core-js/pure/es/array/includes';

QUnit.test('Array#includes', assert => {
  assert.isFunction(includes);
  const object = {};
  const array = [1, 2, 3, -0, object];
  assert.true(includes(array, 1));
  assert.true(includes(array, -0));
  assert.true(includes(array, 0));
  assert.true(includes(array, object));
  assert.false(includes(array, 4));
  assert.false(includes(array, -0.5));
  assert.false(includes(array, {}));
  assert.true(includes(Array(1), undefined));
  assert.true(includes([NaN], NaN));
  if (STRICT) {
    assert.throws(() => includes(null, 0), TypeError);
    assert.throws(() => includes(undefined, 0), TypeError);
  }
});
