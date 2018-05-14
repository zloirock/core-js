import { GLOBAL, NATIVE, STRICT } from '../helpers/constants';

QUnit.test('Array#slice', assert => {
  const { slice } = Array.prototype;
  const { isArray } = Array;
  assert.isFunction(slice);
  assert.arity(slice, 2);
  assert.name(slice, 'slice');
  assert.looksNative(slice);
  assert.nonEnumerable(Array.prototype, 'slice');
  let array = ['1', '2', '3', '4', '5'];
  assert.deepEqual(array.slice(), array);
  assert.deepEqual(array.slice(1, 3), ['2', '3']);
  assert.deepEqual(array.slice(1, undefined), ['2', '3', '4', '5']);
  assert.deepEqual(array.slice(1, -1), ['2', '3', '4']);
  assert.deepEqual(array.slice(-2, -1), ['4']);
  assert.deepEqual(array.slice(-2, -3), []);
  const string = '12345';
  assert.deepEqual(slice.call(string), array);
  assert.deepEqual(slice.call(string, 1, 3), ['2', '3']);
  assert.deepEqual(slice.call(string, 1, undefined), ['2', '3', '4', '5']);
  assert.deepEqual(slice.call(string, 1, -1), ['2', '3', '4']);
  assert.deepEqual(slice.call(string, -2, -1), ['4']);
  assert.deepEqual(slice.call(string, -2, -3), []);
  const list = GLOBAL.document && document.body && document.body.childNodes;
  if (list) {
    assert.notThrows(() => isArray(slice.call(list)), 'works on NodeList');
  }
  if (NATIVE) {
    if (STRICT) {
      assert.throws(() => slice.call(null), TypeError);
      assert.throws(() => slice.call(undefined), TypeError);
    }
    assert.deepEqual(slice.call({
      length: -1,
      0: 1,
    }, 0, 1), [], 'uses ToLength');
  }
  array = [];
  array.constructor = { [Symbol.species]: function () { // eslint-disable-line object-shorthand
    return { foo: 1 };
  } };
  assert.same(array.slice().foo, 1, '@@species');
});
