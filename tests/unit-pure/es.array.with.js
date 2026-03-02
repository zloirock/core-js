import Symbol from '@core-js/pure/es/symbol';
import withAt from '@core-js/pure/es/array/with';

QUnit.test('Array#with', assert => {
  assert.isFunction(withAt);

  let array = [1, 2, 3, 4, 5];
  assert.notSame(withAt(array, 2, 1), array);
  assert.deepEqual(withAt([1, 2, 3, 4, 5], 2, 6), [1, 2, 6, 4, 5]);
  assert.deepEqual(withAt([1, 2, 3, 4, 5], -2, 6), [1, 2, 3, 6, 5]);
  assert.deepEqual(withAt([1, 2, 3, 4, 5], '1', 6), [1, 6, 3, 4, 5]);

  assert.throws(() => withAt([1, 2, 3, 4, 5], 5, 6), RangeError);
  assert.throws(() => withAt([1, 2, 3, 4, 5], -6, 6), RangeError);

  assert.throws(() => withAt(null, 1, 2), TypeError);
  assert.throws(() => withAt(undefined, 1, 2), TypeError);

  array = [1, 2];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.true(withAt(array, 1, 2) instanceof Array, 'non-generic');

  // Incorrect exception thrown when index coercion fails in Firefox
  function CustomError() { /* empty */ }
  const index = { valueOf() { throw new CustomError(); } };
  assert.throws(() => withAt([], index, null), CustomError, 'incorrect error');
});
