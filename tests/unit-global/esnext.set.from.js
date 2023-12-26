import { createIterable } from '../helpers/helpers.js';

QUnit.test('Set.from', assert => {
  const { from } = Set;
  const toArray = Array.from;
  assert.isFunction(from);
  assert.arity(from, 1);
  assert.name(from, 'from');
  assert.looksNative(from);
  assert.nonEnumerable(Set, 'from');
  assert.true(from([]) instanceof Set);
  assert.deepEqual(toArray(from([])), []);
  assert.deepEqual(toArray(from([1])), [1]);
  assert.deepEqual(toArray(from([1, 2, 3, 2, 1])), [1, 2, 3]);
  assert.deepEqual(toArray(from(createIterable([1, 2, 3, 2, 1]))), [1, 2, 3]);
  const context = {};
  from([1], function (element, index) {
    assert.same(element, 1);
    assert.same(index, 0);
    assert.same(this, context);
    return element;
  }, context);
});
