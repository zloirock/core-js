import Symbol from 'core-js-pure/full/symbol';
import concat from 'core-js-pure/full/array/concat';

/* eslint-disable no-sparse-arrays -- required for testing */
QUnit.test('Array#concat', assert => {
  assert.isFunction(concat);
  let array = [1, 2];
  const sparseArray = [1, , 2];
  const nonSpreadableArray = [1, 2];
  nonSpreadableArray[Symbol.isConcatSpreadable] = false;
  const arrayLike = { 0: 1, 1: 2, length: 2 };
  const spreadableArrayLike = { 0: 1, 1: 2, length: 2, [Symbol.isConcatSpreadable]: true };
  assert.deepEqual(concat(array), [1, 2], '#1');
  assert.deepEqual(concat(sparseArray), [1, , 2], '#2');
  assert.deepEqual(concat(nonSpreadableArray), [[1, 2]], '#3');
  assert.deepEqual(concat(arrayLike), [{ 0: 1, 1: 2, length: 2 }], '#4');
  assert.deepEqual(concat(spreadableArrayLike), [1, 2], '#5');
  assert.deepEqual(concat([], array), [1, 2], '#6');
  assert.deepEqual(concat([], sparseArray), [1, , 2], '#7');
  assert.deepEqual(concat([], nonSpreadableArray), [[1, 2]], '#8');
  assert.deepEqual(concat([], arrayLike), [{ 0: 1, 1: 2, length: 2 }], '#9');
  assert.deepEqual(concat([], spreadableArrayLike), [1, 2], '#10');
  assert.deepEqual(concat(array, sparseArray, nonSpreadableArray, arrayLike, spreadableArrayLike), [
    1, 2, 1, , 2, [1, 2], { 0: 1, 1: 2, length: 2 }, 1, 2,
  ], '#11');
  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.same(concat(array).foo, 1, '@@species');
});
