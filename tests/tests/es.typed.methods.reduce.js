import { GLOBAL, DESCRIPTORS, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.reduce', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (var name in TYPED_ARRAYS) {
    var TypedArray = GLOBAL[name];
    var reduce = TypedArray.prototype.reduce;
    assert.isFunction(reduce, name + '::reduce is function');
    assert.arity(reduce, 1, name + '::reduce arity is 1');
    assert.name(reduce, 'reduce', name + "::reduce name is 'reduce'");
    assert.looksNative(reduce, name + '::reduce looks native');
    var array = new TypedArray([1]);
    var accumulator = {};
    array.reduce(function (memo, value, key, that) {
      assert.same(arguments.length, 4, 'correct number of callback arguments');
      assert.same(memo, accumulator, 'correct callback accumulator');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
    }, accumulator);
    assert.same(new TypedArray([1, 2, 3]).reduce(function (a, b) {
      return a + b;
    }, 1), 7, 'works with initial accumulator');
    new TypedArray([1, 2]).reduce(function (memo, value, key) {
      assert.same(memo, 1, 'correct default accumulator');
      assert.same(value, 2, 'correct start value without initial accumulator');
      assert.same(key, 1, 'correct start index without initial accumulator');
    });
    assert.same(new TypedArray([1, 2, 3]).reduce(function (a, b) {
      return a + b;
    }), 6, 'works without initial accumulator');
    var values = '';
    var keys = '';
    new TypedArray([1, 2, 3]).reduce(function (memo, value, key) {
      values += value;
      keys += key;
    }, 0);
    assert.same(values, '123', 'correct order #1');
    assert.same(keys, '012', 'correct order #2');
    assert['throws'](function () {
      reduce.call([0], function () { /* empty */ });
    }, "isn't generic");
  }
});
