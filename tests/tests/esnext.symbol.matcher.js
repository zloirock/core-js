import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Symbol.matcher', assert => {
  assert.ok('matcher' in Symbol, 'Symbol.matcher available');
  assert.nonEnumerable(Symbol, 'matcher');
  assert.ok(Object(Symbol.matcher) instanceof Symbol, 'Symbol.matcher is symbol');
  if (DESCRIPTORS) {
    const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'matcher');
    assert.ok(!descriptor.enumerble, 'non-enumerable');
    assert.ok(!descriptor.writable, 'non-writable');
    assert.ok(!descriptor.configurable, 'non-configurable');
  }
});
