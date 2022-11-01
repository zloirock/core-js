import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Symbol.replaceAll', assert => {
  assert.true('replaceAll' in Symbol, 'Symbol.replaceAll is available');
  assert.nonEnumerable(Symbol, 'replaceAll');
  assert.true(Object(Symbol.replaceAll) instanceof Symbol, 'Symbol.replaceAll is symbol');
  if (DESCRIPTORS) {
    const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'replaceAll');
    assert.false(descriptor.enumerable, 'non-enumerable');
    assert.false(descriptor.writable, 'non-writable');
    assert.false(descriptor.configurable, 'non-configurable');
  }
});
