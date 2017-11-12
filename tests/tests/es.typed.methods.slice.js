import { GLOBAL, DESCRIPTORS, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.slice', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (var name in TYPED_ARRAYS) {
    var TypedArray = GLOBAL[name];
    var slice = TypedArray.prototype.slice;
    assert.isFunction(slice, name + '::slice is function');
    assert.arity(slice, 2, name + '::slice arity is 0');
    assert.name(slice, 'slice', name + "::slice name is 'slice'");
    assert.looksNative(slice, name + '::slice looks native');
    var array = new TypedArray([1, 2, 3, 4, 5]);
    assert.ok(array.slice() !== array, 'returns new array');
    assert.ok(array.slice() instanceof TypedArray, 'correct instance');
    assert.ok(array.slice().buffer !== array.buffer, 'with new buffer');
    assert.arrayEqual(array.slice(), array);
    assert.arrayEqual(array.slice(1, 3), [2, 3]);
    assert.arrayEqual(array.slice(1, undefined), [2, 3, 4, 5]);
    assert.arrayEqual(array.slice(1, -1), [2, 3, 4]);
    assert.arrayEqual(array.slice(-2, -1), [4]);
    assert.arrayEqual(array.slice(-2, -3), []);
    assert.throws(function () {
      slice.call([1, 2], 1);
    }, "isn't generic");
  }
});
