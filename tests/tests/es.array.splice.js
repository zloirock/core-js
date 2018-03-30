import { STRICT } from '../helpers/constants';

QUnit.test('Array#splice', assert => {
  const { splice } = Array.prototype;
  assert.isFunction(splice);
  assert.arity(splice, 2);
  assert.name(splice, 'splice');
  assert.looksNative(splice);
  assert.nonEnumerable(Array.prototype, 'splice');
  let array = [1, 2, 3, 4, 5];
  assert.deepEqual(array.splice(2), [3, 4, 5]);
  assert.deepEqual(array, [1, 2]);
  array = [1, 2, 3, 4, 5];
  assert.deepEqual(array.splice(-2), [4, 5]);
  assert.deepEqual(array, [1, 2, 3]);
  array = [1, 2, 3, 4, 5];
  assert.deepEqual(array.splice(2, 2), [3, 4]);
  assert.deepEqual(array, [1, 2, 5]);
  array = [1, 2, 3, 4, 5];
  assert.deepEqual(array.splice(2, -2), []);
  assert.deepEqual(array, [1, 2, 3, 4, 5]);
  array = [1, 2, 3, 4, 5];
  assert.deepEqual(array.splice(2, 2, 6, 7), [3, 4]);
  assert.deepEqual(array, [1, 2, 6, 7, 5]);
  if (STRICT) {
    assert.throws(() => splice.call(null), TypeError);
    assert.throws(() => splice.call(undefined), TypeError);
  }
  assert.deepEqual(splice.call({
    length: -1,
    0: 1,
  }), [], 'uses ToLength');
  array = [];
  array.constructor = { [Symbol.species]: function () { // eslint-disable-line object-shorthand
    return { foo: 1 };
  } };
  assert.same(array.splice().foo, 1, '@@species');
});
