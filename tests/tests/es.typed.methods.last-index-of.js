import { GLOBAL, DESCRIPTORS, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.lastIndexOf', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (var name in TYPED_ARRAYS) {
    var TypedArray = GLOBAL[name];
    var lastIndexOf = TypedArray.prototype.lastIndexOf;
    assert.isFunction(lastIndexOf, name + '::lastIndexOf is function');
    assert.arity(lastIndexOf, 1, name + '::lastIndexOf arity is 1');
    assert.name(lastIndexOf, 'lastIndexOf', name + "::lastIndexOf name is 'lastIndexOf'");
    assert.looksNative(lastIndexOf, name + '::lastIndexOf looks native');
    assert.same(new TypedArray([1, 1, 1]).lastIndexOf(1), 2);
    assert.same(new TypedArray([1, 2, 3]).lastIndexOf(3, 1), -1);
    assert.same(new TypedArray([1, 2, 3]).lastIndexOf(2, 1), 1);
    assert.same(new TypedArray([1, 2, 3]).lastIndexOf(2, -3), -1);
    assert.same(new TypedArray([1, 2, 3]).lastIndexOf(2, -2), 1);
    assert['throws'](function () {
      lastIndexOf.call([1], 1);
    }, "isn't generic");
  }
});
