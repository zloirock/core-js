import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Symbol.matcher', assert => {
  assert.true('matcher' in Symbol, 'Symbol.matcher available');
  assert.nonEnumerable(Symbol, 'matcher');
  assert.true(Object(Symbol.matcher) instanceof Symbol, 'Symbol.matcher is symbol');
  if (DESCRIPTORS) {
    const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'matcher');
    assert.false(descriptor.enumerable, 'non-enumerable');
    assert.false(descriptor.writable, 'non-writable');
    assert.false(descriptor.configurable, 'non-configurable');
  }
});
