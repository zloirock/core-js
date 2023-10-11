import { STRICT } from '../helpers/constants.js';

import join from '@core-js/pure/es/array/join';

QUnit.test('Array#join', assert => {
  assert.isFunction(join);
  assert.same(join([1, 2, 3], undefined), '1,2,3');
  assert.same(join('123'), '1,2,3');
  assert.same(join('123', '|'), '1|2|3');
  if (STRICT) {
    assert.throws(() => join(null), TypeError);
    assert.throws(() => join(undefined), TypeError);
  }
});
