import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Symbol.metadataKey', assert => {
  assert.true('metadataKey' in Symbol, 'Symbol.metadataKey available');
  assert.nonEnumerable(Symbol, 'metadataKey');
  assert.true(Object(Symbol.metadataKey) instanceof Symbol, 'Symbol.metadataKey is symbol');
  if (DESCRIPTORS) {
    const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'metadataKey');
    assert.false(descriptor.enumerable, 'non-enumerable');
    assert.false(descriptor.writable, 'non-writable');
    assert.false(descriptor.configurable, 'non-configurable');
  }
});
