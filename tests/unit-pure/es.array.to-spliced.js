import Symbol from '@core-js/pure/es/symbol';
import toSpliced from '@core-js/pure/es/array/to-spliced';

QUnit.test('Array#toSpliced', assert => {
  assert.isFunction(toSpliced);

  let array = [1, 2, 3, 4, 5];
  assert.notSame(toSpliced(array, 2), array);
  assert.deepEqual(toSpliced([1, 2, 3, 4, 5], 2), [1, 2]);
  assert.deepEqual(toSpliced([1, 2, 3, 4, 5], -2), [1, 2, 3]);
  assert.deepEqual(toSpliced([1, 2, 3, 4, 5], 2, 2), [1, 2, 5]);
  assert.deepEqual(toSpliced([1, 2, 3, 4, 5], 2, -2), [1, 2, 3, 4, 5]);
  assert.deepEqual(toSpliced([1, 2, 3, 4, 5], 2, 2, 6, 7), [1, 2, 6, 7, 5]);

  assert.throws(() => toSpliced(null), TypeError);
  assert.throws(() => toSpliced(undefined), TypeError);

  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.true(toSpliced(array) instanceof Array, 'non-generic');
});
