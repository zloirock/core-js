import { GLOBAL, DESCRIPTORS, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.some', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (var name in TYPED_ARRAYS) {
    var TypedArray = GLOBAL[name];
    var some = TypedArray.prototype.some;
    assert.isFunction(some, name + '::some is function');
    assert.arity(some, 1, name + '::some arity is 1');
    assert.name(some, 'some', name + "::some name is 'some'");
    assert.looksNative(some, name + '::some looks native');
    var array = new TypedArray([1]);
    var context = {};
    array.some(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    assert.ok(new TypedArray([1, 2, 3]).some(function (it) {
      return typeof it === 'number';
    }));
    assert.ok(new TypedArray([1, 2, 3]).some(function (it) {
      return it < 3;
    }));
    assert.ok(!new TypedArray([1, 2, 3]).some(function (it) {
      return it < 0;
    }));
    assert.ok(!new TypedArray([1, 2, 3]).some(function (it) {
      return typeof it === 'string';
    }));
    assert.ok(new TypedArray([1, 2, 3]).some(function () {
      return +this === 1;
    }, 1));
    var values = '';
    var keys = '';
    new TypedArray([1, 2, 3]).some(function (value, key) {
      values += value;
      keys += key;
    });
    assert.same(values, '123');
    assert.same(keys, '012');
    assert.throws(function () {
      some.call([0], function () { /* empty */ });
    }, "isn't generic");
  }
});
