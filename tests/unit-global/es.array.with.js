QUnit.test('Array#with', assert => {
  const { with: withAt } = Array.prototype;

  assert.isFunction(withAt);
  assert.arity(withAt, 2);
  // assert.name(withAt, 'with');
  assert.looksNative(withAt);
  assert.nonEnumerable(Array.prototype, 'with');

  let array = [1, 2, 3, 4, 5];
  assert.notSame(array.with(2, 1), array, 'immutable');

  assert.deepEqual([1, 2, 3, 4, 5].with(2, 6), [1, 2, 6, 4, 5]);
  assert.deepEqual([1, 2, 3, 4, 5].with(-2, 6), [1, 2, 3, 6, 5]);
  assert.deepEqual([1, 2, 3, 4, 5].with('1', 6), [1, 6, 3, 4, 5]);

  assert.throws(() => [1, 2, 3, 4, 5].with(5, 6), RangeError);
  assert.throws(() => [1, 2, 3, 4, 5].with(-6, 6), RangeError);

  assert.throws(() => withAt.call(null, 1, 2), TypeError);
  assert.throws(() => withAt.call(undefined, 1, 2), TypeError);

  array = [1, 2];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.true(array.with(1, 2) instanceof Array, 'non-generic');

  // Incorrect exception thrown when index coercion fails in Firefox
  function CustomError() { /* empty */ }
  const index = { valueOf() { throw new CustomError(); } };
  assert.throws(() => withAt.call([], index, null), CustomError, 'incorrect error');
});
