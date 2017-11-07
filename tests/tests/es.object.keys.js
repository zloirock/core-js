var test = QUnit.test;

test('Object.keys', function (assert) {
  var keys = Object.keys;
  assert.isFunction(keys);
  assert.arity(keys, 1);
  assert.name(keys, 'keys');
  assert.looksNative(keys);
  assert.nonEnumerable(Object, 'keys');
  function F1() {
    this.w = 1;
  }
  function F2() {
    this.toString = 1;
  }
  F1.prototype.q = F2.prototype.q = 1;
  assert.deepEqual(keys([1, 2, 3]), ['0', '1', '2']);
  assert.deepEqual(keys(new F1()), ['w']);
  assert.deepEqual(keys(new F2()), ['toString']);
  assert.ok(!includes(keys(Array.prototype), 'push'));
  var primitives = [42, 'foo', false];
  for (var i = 0, length = primitives.length; i < length; ++i) {
    var value = primitives[i];
    assert.ok(function () {
      try {
        keys(value);
        return true;
      } catch (e) { /* empty */ }
    }(), 'accept ' + typeof value);
  }
  assert['throws'](function () {
    keys(null);
  }, TypeError, 'throws on null');
  assert['throws'](function () {
    keys(undefined);
  }, TypeError, 'throws on undefined');
});

