import { GLOBAL, DESCRIPTORS, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.toLocaleString', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (var name in TYPED_ARRAYS) {
    var TypedArray = GLOBAL[name];
    var toLocaleString = TypedArray.prototype.toLocaleString;
    assert.isFunction(toLocaleString, name + '::toLocaleString is function');
    assert.arity(toLocaleString, 0, name + '::toLocaleString arity is 0');
    assert.name(toLocaleString, 'toLocaleString', name + "::toLocaleString name is 'toLocaleString'");
    assert.looksNative(toLocaleString, name + '::toLocaleString looks native');
    assert.same(new TypedArray([1, 2, 3]).toLocaleString(), [1, 2, 3].toLocaleString(), 'works');
    assert.throws(function () {
      toLocaleString.call([1, 2, 3]);
    }, "isn't generic");
  }
});
