import { restoreProperty } from '../../helpers/restore-property.cjs';

// `delete Array.from; Array.from?.(...)` keeps the native member (the substitution bails), so the
// optional `?.` MUST survive - dropping it would call the deleted slot unconditionally and throw where
// the native chain short-circuits to undefined. asserts the chain yields undefined rather than throwing.
QUnit.test('mutated-statics: deleted static keeps its optional short-circuit', assert => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(Array, 'from');

  delete Array.from;
  try {
    const r = Array.from?.([1]).at(0);
    assert.same(r, undefined);
  } finally {
    restoreProperty(Array, 'from', originalDescriptor);
  }
});
