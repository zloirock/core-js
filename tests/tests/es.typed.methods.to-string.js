import { GLOBAL, DESCRIPTORS, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.toString', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (var name in TYPED_ARRAYS) {
    var TypedArray = GLOBAL[name];
    var toString = TypedArray.prototype.toString;
    assert.isFunction(toString, name + '::toString is function');
    assert.arity(toString, 0, name + '::toString arity is 0');
    assert.name(toString, 'toString', name + "::toString name is 'toString'");
    assert.looksNative(toString, name + '::toString looks native');
    assert.same(new TypedArray([1, 2, 3]).toString(), '1,2,3', 'works');
    assert.same(toString.call([1, 2, 3]), '1,2,3', 'generic');
  }
});
