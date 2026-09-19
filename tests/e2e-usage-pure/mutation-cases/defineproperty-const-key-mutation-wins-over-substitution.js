import { restoreProperty } from '../../helpers/restore-property.cjs';

// the same const-key resolution applies when the patch arrives through Object.defineProperty
// with a const-aliased key argument (restored through the same key)
QUnit.test('mutated-statics: defineProperty const-key mutation wins over substitution', assert => {
  const key = 'fromEntries';
  const originalDescriptor = Object.getOwnPropertyDescriptor(Object, key);

  Object.defineProperty(Object, key, {
    value: function patched() { return 'dp-patched'; },
    configurable: true,
    writable: true,
  });
  try {
    assert.same(Object.fromEntries([['a', 1]]), 'dp-patched');
  } finally {
    restoreProperty(Object, key, originalDescriptor);
  }
});
