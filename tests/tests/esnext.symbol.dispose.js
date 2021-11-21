import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Symbol.dispose', assert => {
  assert.true('dispose' in Symbol, 'Symbol.dispose available');
  assert.nonEnumerable(Symbol, 'dispose');
  assert.true(Object(Symbol.dispose) instanceof Symbol, 'Symbol.dispose is symbol');
  if (DESCRIPTORS) {
    const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'dispose');
    assert.false(descriptor.enumerable, 'non-enumerable');
    assert.false(descriptor.writable, 'non-writable');
    assert.false(descriptor.configurable, 'non-configurable');
  }
});
