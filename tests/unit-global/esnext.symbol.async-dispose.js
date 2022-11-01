import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Symbol.asyncDispose', assert => {
  assert.true('asyncDispose' in Symbol, 'Symbol.asyncDispose available');
  assert.nonEnumerable(Symbol, 'asyncDispose');
  assert.true(Object(Symbol.asyncDispose) instanceof Symbol, 'Symbol.asyncDispose is symbol');
  if (DESCRIPTORS) {
    const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'asyncDispose');
    assert.false(descriptor.enumerable, 'non-enumerable');
    assert.false(descriptor.writable, 'non-writable');
    assert.false(descriptor.configurable, 'non-configurable');
  }
});
