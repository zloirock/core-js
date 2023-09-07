import { DESCRIPTORS } from '../helpers/constants.js';

QUnit.test('Symbol.patternMatch', assert => {
  assert.true('patternMatch' in Symbol, 'Symbol.patternMatch available');
  assert.nonEnumerable(Symbol, 'patternMatch');
  assert.true(Object(Symbol.patternMatch) instanceof Symbol, 'Symbol.patternMatch is symbol');
  if (DESCRIPTORS) {
    const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'patternMatch');
    assert.false(descriptor.enumerable, 'non-enumerable');
    assert.false(descriptor.writable, 'non-writable');
    assert.false(descriptor.configurable, 'non-configurable');
  }
});
