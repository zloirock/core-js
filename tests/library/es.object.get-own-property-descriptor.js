QUnit.test('Object.getOwnPropertyDescriptor', function (assert) {
  var getOwnPropertyDescriptor = core.Object.getOwnPropertyDescriptor;
  assert.isFunction(getOwnPropertyDescriptor);
  assert.arity(getOwnPropertyDescriptor, 2);
  assert.deepEqual(getOwnPropertyDescriptor({ q: 42 }, 'q'), {
    writable: true,
    enumerable: true,
    configurable: true,
    value: 42
  });
  assert.ok(getOwnPropertyDescriptor({}, 'toString') === undefined);
  var primitives = [42, 'foo', false];
  for (var i = 0, length = primitives.length; i < length; ++i) {
    var value = primitives[i];
    assert.ok(function () {
      try {
        getOwnPropertyDescriptor(value);
        return true;
      } catch (e) { /* empty */ }
    }(), 'accept ' + typeof value);
  }
  assert.throws(function () {
    getOwnPropertyDescriptor(null);
  }, TypeError, 'throws on null');
  assert.throws(function () {
    getOwnPropertyDescriptor(undefined);
  }, TypeError, 'throws on undefined');
});
