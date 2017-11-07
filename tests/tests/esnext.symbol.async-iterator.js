var test = QUnit.test;

test('Symbol.asyncIterator', function (assert) {
  assert.ok('asyncIterator' in Symbol, 'Symbol.asyncIterator available');
  assert.nonEnumerable(Symbol, 'asyncIterator');
  assert.ok(Object(Symbol.asyncIterator) instanceof Symbol, 'Symbol.asyncIterator is symbol');
  if (DESCRIPTORS) {
    var descriptor = Object.getOwnPropertyDescriptor(Symbol, 'asyncIterator');
    assert.ok(!descriptor.enumerble, 'non-enumerable');
    assert.ok(!descriptor.writable, 'non-writable');
    assert.ok(!descriptor.configurable, 'non-configurable');
  }
});
