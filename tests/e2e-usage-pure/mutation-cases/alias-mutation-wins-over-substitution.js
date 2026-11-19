import { restoreProperty } from '../../helpers/restore-property.cjs';

// A patch through a const alias must win over substitution for both alias and direct reads.
QUnit.test('mutated-statics: alias mutation wins over substitution', assert => {
  const A = Array;

  const originalDescriptor = Object.getOwnPropertyDescriptor(A, 'of');

  A.of = function patched() {
    return 'patched';
  };
  assert.same(A.of(1), 'patched');
  assert.same(Array.of(2), 'patched');
  // precise restore: assigning `undefined` back would leave an own undefined property
  restoreProperty(A, 'of', originalDescriptor);
});
