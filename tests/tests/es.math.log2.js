var test = QUnit.test;

test('Math.log2', function (assert) {
  var log2 = Math.log2;
  assert.isFunction(log2);
  assert.name(log2, 'log2');
  assert.arity(log2, 1);
  assert.looksNative(log2);
  assert.nonEnumerable(Math, 'log2');
  assert.same(log2(''), log2(0));
  assert.same(log2(NaN), NaN);
  assert.same(log2(-1), NaN);
  assert.same(log2(0), -Infinity);
  assert.same(log2(-0), -Infinity);
  assert.same(log2(1), 0);
  assert.same(log2(Infinity), Infinity);
  assert.same(log2(0.5), -1);
  assert.same(log2(32), 5);
  assert.epsilon(log2(5), 2.321928094887362);
});
