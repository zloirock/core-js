import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Symbol.replaceAll', assert => {
  assert.ok('replaceAll' in Symbol, 'Symbol.replaceAll is available');
  assert.nonEnumerable(Symbol, 'replaceAll');
  assert.ok(Object(Symbol.replaceAll) instanceof Symbol, 'Symbol.replaceAll is symbol');
  if (DESCRIPTORS) {
    const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'replaceAll');
    assert.ok(!descriptor.enumerble, 'non-enumerable');
    assert.ok(!descriptor.writable, 'non-writable');
    assert.ok(!descriptor.configurable, 'non-configurable');
  }
});
