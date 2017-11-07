var test = QUnit.test;

if (DESCRIPTORS) test('%TypedArrayPrototype%.reduceRight', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  var arrays = ['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Uint8ClampedArray'];
  for (var i = 0, length = arrays.length; i < length; ++i) {
    var name = arrays[i];
    var TypedArray = global[name];
    var reduceRight = TypedArray.prototype.reduceRight;
    assert.isFunction(reduceRight, name + '::reduceRight is function');
    assert.arity(reduceRight, 1, name + '::reduceRight arity is 1');
    assert.name(reduceRight, 'reduceRight', name + "::reduceRight name is 'reduceRight'");
    assert.looksNative(reduceRight, name + '::reduceRight looks native');
    var array = new TypedArray([1]);
    var accumulator = {};
    array.reduceRight(function (memo, value, key, that) {
      assert.same(arguments.length, 4, 'correct number of callback arguments');
      assert.same(memo, accumulator, 'correct callback accumulator');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
    }, accumulator);
    assert.same(new TypedArray([1, 2, 3]).reduceRight(function (a, b) {
      return a + b;
    }, 1), 7, 'works with initial accumulator');
    new TypedArray([1, 2]).reduceRight(function (memo, value, key) {
      assert.same(memo, 2, 'correct default accumulator');
      assert.same(value, 1, 'correct start value without initial accumulator');
      assert.same(key, 0, 'correct start index without initial accumulator');
    });
    assert.same(new TypedArray([1, 2, 3]).reduceRight(function (a, b) {
      return a + b;
    }), 6, 'works without initial accumulator');
    var values = '';
    var keys = '';
    new TypedArray([1, 2, 3]).reduceRight(function (memo, value, key) {
      values += value;
      keys += key;
    }, 0);
    assert.same(values, '321', 'correct order #1');
    assert.same(keys, '210', 'correct order #2');
    assert['throws'](function () {
      reduceRight.call([0], function () { /* empty */ });
    }, "isn't generic");
  }
});
