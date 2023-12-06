QUnit.test('Array#lastIndexOf', assert => {
  const { lastIndexOf } = Array.prototype;
  assert.isFunction(lastIndexOf);
  assert.arity(lastIndexOf, 1);
  assert.name(lastIndexOf, 'lastIndexOf');
  assert.looksNative(lastIndexOf);
  assert.nonEnumerable(Array.prototype, 'lastIndexOf');

  assert.same([1, 1, 1].lastIndexOf(1), 2);
  assert.same([1, 2, 3].lastIndexOf(3, 1), -1);
  assert.same([1, 2, 3].lastIndexOf(2, 1), 1);
  assert.same([1, 2, 3].lastIndexOf(2, -3), -1);
  assert.same([1, 2, 3].lastIndexOf(1, -4), -1);
  assert.same([1, 2, 3].lastIndexOf(2, -2), 1);
  assert.same([NaN].lastIndexOf(NaN), -1);
  assert.same([1, 2, 3].concat(Array(2)).lastIndexOf(2), 1);
  assert.same([1].lastIndexOf(1, -0), 0, "shouldn't return negative zero");

  assert.throws(() => lastIndexOf.call(null, 0), TypeError);
  assert.throws(() => lastIndexOf.call(undefined, 0), TypeError);
});
