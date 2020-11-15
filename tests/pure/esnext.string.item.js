import { STRICT } from '../helpers/constants';

import item from 'core-js-pure/features/string/item';

QUnit.test('String#item', assert => {
  assert.isFunction(item);
  assert.same('1', item('123', 0));
  assert.same('2', item('123', 1));
  assert.same('3', item('123', 2));
  assert.same(undefined, item('123', 3));
  assert.same('3', item('123', -1));
  assert.same('2', item('123', -2));
  assert.same('1', item('123', -3));
  assert.same(undefined, item('123', -4));
  assert.same('1', item('123', 0.4));
  assert.same('1', item('123', 0.5));
  assert.same('1', item('123', 0.6));
  assert.same('1', item('1', NaN));
  assert.same('1', item('1'));
  assert.same('1', item('123', -0));
  assert.same('1', item({ toString() { return '123'; } }, 0));
  if (STRICT) {
    assert.throws(() => item(null, 0), TypeError);
    assert.throws(() => item(undefined, 0), TypeError);
  }
});
