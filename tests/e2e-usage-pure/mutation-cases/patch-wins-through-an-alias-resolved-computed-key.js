import { restoreProperty } from '../../helpers/restore-property.cjs';

// a user patch on the static wins through an ALIAS-resolved computed key exactly like the
// literal spelling - the alias names the same mutated slot, so no ponyfill may substitute
QUnit.test('mutated-statics: patch wins through an alias-resolved computed key', assert => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(Array, 'from');

  Array.from = function patched() { return 'ALIAS-KEY'; };
  try {
    const key = 'from';
    const aliasedKey = key;
    assert.same(Array[aliasedKey]?.([1]), 'ALIAS-KEY');
  } finally {
    restoreProperty(Array, 'from', originalDescriptor);
  }
});
