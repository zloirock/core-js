import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Symbol.patternValue', assert => {
  assert.ok('patternValue' in Symbol, 'Symbol.patternValue available');
  assert.nonEnumerable(Symbol, 'patternValue');
  assert.ok(Object(Symbol.patternValue) instanceof Symbol, 'Symbol.patternValue is symbol');
  if (DESCRIPTORS) {
    const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'patternValue');
    assert.ok(!descriptor.enumerble, 'non-enumerable');
    assert.ok(!descriptor.writable, 'non-writable');
    assert.ok(!descriptor.configurable, 'non-configurable');
  }
});
