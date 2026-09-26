import { restoreProperty } from '../../helpers/restore-property.cjs';

// An `Object.assign` source given as a const-bound variable resolves to its object-literal init, so the
// copied static key is detected like an inline literal source. only the patch contributes a local mutation.
QUnit.test('mutated-statics: variable-source Object.assign mutation wins over substitution', assert => {
  function patched() { return 'var-source-win'; }
  const originalDescriptor = Object.getOwnPropertyDescriptor(Iterator, 'concat');

  const patchSrc = { concat: patched };
  Object.assign(Iterator, patchSrc);
  try {
    assert.same(Iterator.concat([]), 'var-source-win');
  } finally {
    restoreProperty(Iterator, 'concat', originalDescriptor);
  }
});
