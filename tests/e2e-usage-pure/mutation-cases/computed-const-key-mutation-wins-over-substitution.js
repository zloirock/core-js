import { restoreProperty } from '../../helpers/restore-property.cjs';

// A const-aliased key names the same slot as a dotted read. Only the computed write
// may mark it mutated: the foreign cleanup helper contributes no local mutation.
QUnit.test('mutated-statics: computed const-key mutation wins over substitution', assert => {
  const key = 'from';

  const originalDescriptor = Object.getOwnPropertyDescriptor(Array, key);

  Array[key] = function patched() {
    return 'cck-patched';
  };
  try {
    assert.same(Array.from([1]), 'cck-patched');
  } finally {
    restoreProperty(Array, key, originalDescriptor);
  }
});
