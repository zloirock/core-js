import { createIterable } from '../helpers/helpers';

import Set from 'core-js-pure/fn/set';
import toArray from 'core-js-pure/fn/array/from';

QUnit.test('Set.from', assert => {
  const { from } = Set;
  assert.isFunction(from);
  assert.arity(from, 1);
  assert.ok(Set.from() instanceof Set);
  assert.deepEqual(toArray(Set.from([])), []);
  assert.deepEqual(toArray(Set.from([1])), [1]);
  assert.deepEqual(toArray(Set.from([1, 2, 3, 2, 1])), [1, 2, 3]);
  assert.deepEqual(toArray(Set.from(createIterable([1, 2, 3, 2, 1]))), [1, 2, 3]);
  const context = {};
  Set.from([1], function (element, index) {
    assert.same(element, 1);
    assert.same(index, 0);
    assert.same(this, context);
    return element;
  }, context);
  assert.throws(() => from(1));
  let arg = null;
  function F(it) {
    return arg = it;
  }
  from.call(F, createIterable([1, 2, 3]), it => it ** 2);
  assert.deepEqual(arg, [1, 4, 9]);
});
