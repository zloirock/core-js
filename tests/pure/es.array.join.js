import { STRICT } from '../helpers/constants';

import join from '../../packages/core-js-pure/fn/array/join';

QUnit.test('Array#join', assert => {
  assert.isFunction(join);
  assert.strictEqual(join([1, 2, 3], undefined), '1,2,3');
  assert.strictEqual(join('123'), '1,2,3');
  assert.strictEqual(join('123', '|'), '1|2|3');
  if (STRICT) {
    assert.throws(() => join(null), TypeError);
    assert.throws(() => join(undefined), TypeError);
  }
});
