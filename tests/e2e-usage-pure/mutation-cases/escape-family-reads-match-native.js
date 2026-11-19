
// the escape family at runtime: a repositioned container, a thrown-and-patched one and an aliased
// one must all read what the PROGRAM left in the slot, never the polyfill. locals only - no restore
QUnit.test('mutated-statics: escape-family reads match native', assert => {
  const repositioned = [{ of: () => 'FIRST' }, Array];
  repositioned.reverse();
  const { 0: { of: shifted } } = repositioned;
  // The repositioned container is opaque; compare with the actual native slot. A direct
  // Array.of read is independently polyfilled and is a different value in the stripped leg.
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'of');
  assert.same(shifted, descriptor && descriptor.value);
  if (shifted) assert.deepEqual(shifted(7), [7]);
  const thrown = { k: Array };
  try {
    throw thrown;
  } catch (error) {
    error.k = { of: () => 'CAUGHT' };
  }
  const { k: { of: fromThrown } } = thrown;
  assert.same(fromThrown(1), 'CAUGHT');
  const aliased = { k: Array };
  const aliasHandle = aliased;
  aliasHandle.k = { of: () => 'ALIASED' };
  const { k: { of: fromAlias } } = aliased;
  assert.same(fromAlias(1), 'ALIASED');
});
