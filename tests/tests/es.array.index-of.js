import { DESCRIPTORS, NATIVE, STRICT } from '../helpers/constants';

QUnit.test('Array#indexOf', assert => {
  const { indexOf } = Array.prototype;
  assert.isFunction(indexOf);
  assert.arity(indexOf, 1);
  assert.name(indexOf, 'indexOf');
  assert.looksNative(indexOf);
  assert.nonEnumerable(Array.prototype, 'indexOf');
  assert.same(0, [1, 1, 1].indexOf(1));
  assert.same(-1, [1, 2, 3].indexOf(1, 1));
  assert.same(1, [1, 2, 3].indexOf(2, 1));
  assert.same(-1, [1, 2, 3].indexOf(2, -1));
  assert.same(1, [1, 2, 3].indexOf(2, -2));
  assert.same(-1, [NaN].indexOf(NaN));
  assert.same(3, Array(2).concat([1, 2, 3]).indexOf(2));
  assert.same(-1, Array(1).indexOf(undefined));
  assert.same(0, [1].indexOf(1, -0), "shouldn't return negative zero");
  if (STRICT) {
    assert.throws(() => indexOf.call(null, 0), TypeError);
    assert.throws(() => indexOf.call(undefined, 0), TypeError);
  }
  if (NATIVE && DESCRIPTORS) {
    assert.notThrows(() => indexOf.call(Object.defineProperty({
      length: -1,
    }, 0, {
      get() {
        throw new Error();
      },
    }), 1) === -1, 'uses ToLength');
  }
});
