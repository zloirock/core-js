import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutated-statics: logical-receiver mutation wins over substitution', assert => {
  function patched() { return 'logical-win'; }
  const originalDescriptor = Object.getOwnPropertyDescriptor(Promise, 'all');

  // a falsy left operand (`[].pop()` is undefined) selects the Promise branch at runtime; the gate fans
  // both branches statically
  ([].pop() || Promise).all = patched;
  try {
    assert.same(Promise.all([]), 'logical-win');
  } finally {
    restoreProperty(Promise, 'all', originalDescriptor);
  }
});
