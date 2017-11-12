import { GLOBAL, DESCRIPTORS, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.every', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (var name in TYPED_ARRAYS) {
    var TypedArray = GLOBAL[name];
    var every = TypedArray.prototype.every;
    assert.isFunction(every, name + '::every is function');
    assert.arity(every, 1, name + '::every arity is 1');
    assert.name(every, 'every', name + "::every name is 'every'");
    assert.looksNative(every, name + '::every looks native');
    var array = new TypedArray([1]);
    var context = {};
    array.every(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    assert.ok(new TypedArray([1, 2, 3]).every(function (it) {
      return typeof it === 'number';
    }));
    assert.ok(new TypedArray([1, 2, 3]).every(function (it) {
      return it < 4;
    }));
    assert.ok(!new TypedArray([1, 2, 3]).every(function (it) {
      return it < 3;
    }));
    assert.ok(!new TypedArray([1, 2, 3]).every(function (it) {
      return typeof it === 'string';
    }));
    assert.ok(new TypedArray([1, 2, 3]).every(function () {
      return +this === 1;
    }, 1));
    var values = '';
    var keys = '';
    new TypedArray([1, 2, 3]).every(function (value, key) {
      values += value;
      keys += key;
      return true;
    });
    assert.same(values, '123');
    assert.same(keys, '012');
    assert.throws(function () {
      every.call([0], function () { /* empty */ });
    }, "isn't generic");
  }
});
