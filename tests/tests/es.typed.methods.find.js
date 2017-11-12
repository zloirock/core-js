import { GLOBAL, DESCRIPTORS, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.find', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (var name in TYPED_ARRAYS) {
    var TypedArray = GLOBAL[name];
    var find = TypedArray.prototype.find;
    assert.isFunction(find, name + '::find is function');
    assert.arity(find, 1, name + '::find arity is 1');
    assert.name(find, 'find', name + "::find name is 'find'");
    assert.looksNative(find, name + '::find looks native');
    var array = new TypedArray([1]);
    var context = {};
    array.find(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    assert.same(new TypedArray([1, 2, 3]).find(function (it) {
      return !(it % 2);
    }), 2);
    assert.same(new TypedArray([1, 2, 3]).find(function (it) {
      return it === 4;
    }), undefined);
    var values = '';
    var keys = '';
    new TypedArray([1, 2, 3]).find(function (value, key) {
      values += value;
      keys += key;
    });
    assert.same(values, '123');
    assert.same(keys, '012');
    assert['throws'](function () {
      find.call([0], function () { /* empty */ });
    }, "isn't generic");
  }
});
