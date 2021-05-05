import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Symbol.metadata', assert => {
  assert.ok('metadata' in Symbol, 'Symbol.metadata available');
  assert.nonEnumerable(Symbol, 'metadata');
  assert.ok(Object(Symbol.metadata) instanceof Symbol, 'Symbol.metadata is symbol');
  if (DESCRIPTORS) {
    const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'metadata');
    assert.ok(!descriptor.enumerble, 'non-enumerable');
    assert.ok(!descriptor.writable, 'non-writable');
    assert.ok(!descriptor.configurable, 'non-configurable');
  }
});
