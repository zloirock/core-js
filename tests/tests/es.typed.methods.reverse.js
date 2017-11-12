import { GLOBAL, DESCRIPTORS, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.reverse', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (var name in TYPED_ARRAYS) {
    var TypedArray = GLOBAL[name];
    var reverse = TypedArray.prototype.reverse;
    assert.isFunction(reverse, name + '::reverse is function');
    assert.arity(reverse, 0, name + '::reverse arity is 0');
    assert.name(reverse, 'reverse', name + "::reverse name is 'reverse'");
    assert.looksNative(reverse, name + '::reverse looks native');
    var array = new TypedArray([1, 2]);
    assert.same(array.reverse(), array, 'return this');
    assert.arrayEqual(new TypedArray([1, 2, 3, 4]).reverse(), [4, 3, 2, 1], 'works #1');
    assert.arrayEqual(new TypedArray([1, 2, 3]).reverse(), [3, 2, 1], 'works #2');
    assert['throws'](function () {
      reverse.call([1, 2]);
    }, "isn't generic");
  }
});
