var test = QUnit.test;

test('Symbol.observable', function (assert) {
  assert.ok('observable' in Symbol, 'Symbol.observable available');
  assert.nonEnumerable(Symbol, 'observable');
  assert.ok(Object(Symbol.observable) instanceof Symbol, 'Symbol.observable is symbol');
  if (DESCRIPTORS) {
    var descriptor = Object.getOwnPropertyDescriptor(Symbol, 'observable');
    assert.ok(!descriptor.enumerble, 'non-enumerable');
    assert.ok(!descriptor.writable, 'non-writable');
    assert.ok(!descriptor.configurable, 'non-configurable');
  }
});
