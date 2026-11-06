import { restoreProperty } from '../../helpers/restore-property.cjs';

// a wrapper-fronted namespace (`(0, Object).assign(...)`, a common minified shape) still
// resolves to the global Object, so the assign-installed patch wins over the substitution.
// restore through a computed key so the slot is only ever touched via untracked-by-the-old-code
// shapes - a dotted restore would mark it mutated and mask the wrapper-peel under test
QUnit.test('mutated-statics: wrapper-fronted assign mutation wins over substitution', assert => {
  const key = 'fromAsync';

  const originalDescriptor = Object.getOwnPropertyDescriptor(Array, key);

  (0, Object).assign(Array, { fromAsync: function patched() { return 'wf-patched'; } });
  try {
    assert.same(Array.fromAsync([1]), 'wf-patched');
  } finally {
    restoreProperty(Array, key, originalDescriptor);
  }
});
