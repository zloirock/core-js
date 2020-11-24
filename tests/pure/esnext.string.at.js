import { STRICT } from '../helpers/constants';

import at from 'core-js-pure/features/string/at';

QUnit.test('String#at', assert => {
  assert.isFunction(at);
  assert.same('1', at('123', 0));
  assert.same('2', at('123', 1));
  assert.same('3', at('123', 2));
  assert.same(undefined, at('123', 3));
  assert.same('3', at('123', -1));
  assert.same('2', at('123', -2));
  assert.same('1', at('123', -3));
  assert.same(undefined, at('123', -4));
  assert.same('1', at('123', 0.4));
  assert.same('1', at('123', 0.5));
  assert.same('1', at('123', 0.6));
  assert.same('1', at('1', NaN));
  assert.same('1', at('1'));
  assert.same('1', at('123', -0));
  assert.same('\uD842', at('𠮷'));
  assert.same('1', at({ toString() { return '123'; } }, 0));
  if (STRICT) {
    assert.throws(() => at(null, 0), TypeError);
    assert.throws(() => at(undefined, 0), TypeError);
  }
});
