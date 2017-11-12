import { GLOBAL, DESCRIPTORS, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.copyWithin', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (var name in TYPED_ARRAYS) {
    var TypedArray = GLOBAL[name];
    var copyWithin = TypedArray.prototype.copyWithin;
    assert.isFunction(copyWithin, name + '::copyWithin is function');
    assert.arity(copyWithin, 2, name + '::copyWithin arity is 2');
    assert.name(copyWithin, 'copyWithin', name + "::copyWithin name is 'copyWithin'");
    assert.looksNative(copyWithin, name + '::copyWithin looks native');
    var array = new TypedArray(5);
    assert.strictEqual(array.copyWithin(0), array, 'return this');
    assert.arrayEqual(new TypedArray([1, 2, 3, 4, 5]).copyWithin(0, 3), [4, 5, 3, 4, 5]);
    assert.arrayEqual(new TypedArray([1, 2, 3, 4, 5]).copyWithin(1, 3), [1, 4, 5, 4, 5]);
    assert.arrayEqual(new TypedArray([1, 2, 3, 4, 5]).copyWithin(1, 2), [1, 3, 4, 5, 5]);
    assert.arrayEqual(new TypedArray([1, 2, 3, 4, 5]).copyWithin(2, 2), [1, 2, 3, 4, 5]);
    assert.arrayEqual(new TypedArray([1, 2, 3, 4, 5]).copyWithin(0, 3, 4), [4, 2, 3, 4, 5]);
    assert.arrayEqual(new TypedArray([1, 2, 3, 4, 5]).copyWithin(1, 3, 4), [1, 4, 3, 4, 5]);
    assert.arrayEqual(new TypedArray([1, 2, 3, 4, 5]).copyWithin(1, 2, 4), [1, 3, 4, 4, 5]);
    assert.arrayEqual(new TypedArray([1, 2, 3, 4, 5]).copyWithin(0, -2), [4, 5, 3, 4, 5]);
    assert.arrayEqual(new TypedArray([1, 2, 3, 4, 5]).copyWithin(0, -2, -1), [4, 2, 3, 4, 5]);
    assert.arrayEqual(new TypedArray([1, 2, 3, 4, 5]).copyWithin(-4, -3, -2), [1, 3, 3, 4, 5]);
    assert.arrayEqual(new TypedArray([1, 2, 3, 4, 5]).copyWithin(-4, -3, -1), [1, 3, 4, 4, 5]);
    assert.arrayEqual(new TypedArray([1, 2, 3, 4, 5]).copyWithin(-4, -3), [1, 3, 4, 5, 5]);
    assert.throws(function () {
      copyWithin.call([0], 1);
    }, "isn't generic");
  }
});
