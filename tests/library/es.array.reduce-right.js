var test = QUnit.test;

test('Array#reduceRight', function (assert) {
  var reduceRight = core.Array.reduceRight;
  assert.isFunction(reduceRight);
  var array = [1];
  var accumulator = {};
  reduceRight(array, function (memo, value, key, that) {
    assert.same(arguments.length, 4, 'correct number of callback arguments');
    assert.same(memo, accumulator, 'correct callback accumulator');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
  }, accumulator);
  assert.same(reduceRight([1, 2, 3], function (a, b) {
    return a + b;
  }, 1), 7, 'works with initial accumulator');
  reduceRight([1, 2], function (memo, value, key, that) {
    assert.same(memo, 2, 'correct default accumulator');
    assert.same(value, 1, 'correct start value without initial accumulator');
    assert.same(key, 0, 'correct start index without initial accumulator');
  });
  assert.same(reduceRight([1, 2, 3], function (a, b) {
    return a + b;
  }), 6, 'works without initial accumulator');
  var values = '';
  var keys = '';
  reduceRight([1, 2, 3], function (memo, value, key) {
    values += value;
    keys += key;
  }, 0);
  assert.same(values, '321', 'correct order #1');
  assert.same(keys, '210', 'correct order #2');
  assert.same(reduceRight({
    0: 1,
    1: 2,
    length: 2
  }, function (a, b) {
    return a + b;
  }), 3, 'generic');
  if (STRICT) {
    assert['throws'](function () {
      reduceRight(null, function () { /* empty */ }, 1);
    }, TypeError);
    assert['throws'](function () {
      reduceRight(undefined, function () { /* empty */ }, 1);
    }, TypeError);
  }
});
