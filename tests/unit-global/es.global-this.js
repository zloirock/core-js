import { DESCRIPTORS, GLOBAL } from '../helpers/constants.js';

QUnit.test('globalThis', assert => {
  assert.same(globalThis, Object(globalThis), 'is object');
  assert.same(globalThis.Math, Math, 'contains globals');
  assert.same(globalThis, GLOBAL, 'is the global object');
  if (DESCRIPTORS) {
    const descriptor = Object.getOwnPropertyDescriptor(GLOBAL, 'globalThis');
    assert.same(descriptor.value, GLOBAL, 'a data property');
    assert.true(descriptor.writable, 'writable');
    assert.false(descriptor.enumerable, 'non-enumerable');
    assert.true(descriptor.configurable, 'configurable');
  }
});
