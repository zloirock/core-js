import { restoreProperty } from '../../helpers/restore-property.cjs';

// A ternary receiver names a built-in through either branch. The patch and read must
// route through the same constructor; cleanup in another module cannot mark this slot.
QUnit.test('mutated-statics: ternary-receiver mutation wins over substitution', assert => {
  function patched() { return 'ternary-win'; }
  const useP = true;
  const originalDescriptor = Object.getOwnPropertyDescriptor(Promise, 'any');

  (useP ? Promise : Map).any = patched;
  try {
    assert.same(Promise.any([]), 'ternary-win');
  } finally {
    restoreProperty(Promise, 'any', originalDescriptor);
  }
});
