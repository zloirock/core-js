import { STRICT } from '../helpers/constants';

import Set from 'core-js-pure/fn/set';

QUnit.test('Set#join', assert => {
  const { join } = Set.prototype;

  assert.isFunction(join);
  assert.arity(join, 1);
  if ('name' in join) assert.name(join, 'join');
  assert.nonEnumerable(Set.prototype, 'join');

  assert.strictEqual(new Set([1, 2, 3]).join(), '1,2,3');
  assert.strictEqual(new Set([1, 2, 3]).join(undefined), '1,2,3');
  assert.strictEqual(new Set([1, 2, 3]).join('|'), '1|2|3');

  assert.throws(() => join.call({}, ''), TypeError);

  if (STRICT) {
    assert.throws(() => join.call(null, 0), TypeError);
    assert.throws(() => join.call(undefined, 0), TypeError);
  }
});
