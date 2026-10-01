import { restoreProperty } from '../../helpers/restore-property.cjs';

// a LOCAL Object shadow silences only the BARE mutator callee: a proxy-global chain still names
// the REAL namespace, so a patch through it is recorded and the later read keeps the user patch
// instead of routing to the receiver-less pure helper. Cleanup lives in a foreign module so
// it cannot mark the slot in this source.
QUnit.test('mutated-statics: proxy-global mutator with a local namespace shadow keeps the patch', assert => {
  const Object = { defineProperty() { return 'local-noop'; } };
  const Reflect = { deleteProperty() { return 'local-noop'; } };
  assert.same(Object.defineProperty(), 'local-noop');
  assert.same(Reflect.deleteProperty(), 'local-noop');

  const originalDescriptor = globalThis.Object.getOwnPropertyDescriptor(Math, 'sumPrecise');

  globalThis.Object.defineProperty(Math, 'sumPrecise', {
    value: function patched() { return 'proxy-shadow-patched'; },
    configurable: true,
    writable: true,
  });
  try {
    assert.same(Math.sumPrecise([1, 2]), 'proxy-shadow-patched');
  } finally {
    restoreProperty(Math, 'sumPrecise', originalDescriptor);
  }
});
