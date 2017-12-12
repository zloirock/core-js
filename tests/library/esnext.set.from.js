import { createIterable } from '../helpers/helpers';

QUnit.test('Set.from', assert => {
  const { Set } = core;
  const { from } = Set;
  assert.isFunction(from);
  assert.arity(from, 1);
  assert.ok(Set.from() instanceof Set);
  assert.deepEqual(core.Array.from(Set.from([])), []);
  assert.deepEqual(core.Array.from(Set.from([1])), [1]);
  assert.deepEqual(core.Array.from(Set.from([1, 2, 3, 2, 1])), [1, 2, 3]);
  assert.deepEqual(core.Array.from(Set.from(createIterable([1, 2, 3, 2, 1]))), [1, 2, 3]);
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
