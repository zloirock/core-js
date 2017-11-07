var test = QUnit.test;

test('Array.of', function (assert) {
  var defineProperty = Object.defineProperty;
  assert.isFunction(Array.of);
  assert.arity(Array.of, 0);
  assert.name(Array.of, 'of');
  assert.looksNative(Array.of);
  assert.nonEnumerable(Array, 'of');
  assert.deepEqual(Array.of(1), [1]);
  assert.deepEqual(Array.of(1, 2, 3), [1, 2, 3]);
  function F() { /* empty */ }
  var instance = Array.of.call(F, 1, 2);
  assert.ok(instance instanceof F);
  assert.strictEqual(instance[0], 1);
  assert.strictEqual(instance[1], 2);
  assert.strictEqual(instance.length, 2);
  if (DESCRIPTORS) {
    var called = false;
    defineProperty(F.prototype, 0, {
      set: function () {
        var called;
        called = true;
      }
    });
    Array.of.call(F, 1, 2, 3);
    assert.ok(!called, 'Should not call prototype accessors');
  }
});
