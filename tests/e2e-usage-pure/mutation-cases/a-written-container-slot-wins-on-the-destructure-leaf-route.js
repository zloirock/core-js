
// a slot WRITTEN after the container literal no longer holds what the literal spells, and the
// DESTRUCTURE-LEAF spelling reads it exactly like the member spelling does: `const { Array: A } =
// box` after `box.Array = Fake` binds the replacement. before the fix only the member route
// consulted the written-slot record, so this spelling substituted the ponyfill over the user's
// object and `A.from` answered the polyfill instead of the replacement
QUnit.test('mutated-statics: a written container slot wins on the destructure-leaf route', assert => {
  const box = { Array };
  box.Array = { from: () => 'WRITTEN-SLOT' };
  const { Array: A } = box;
  assert.same(A.from([1]), 'WRITTEN-SLOT');
  // the member spelling of the same read agrees - one record, one answer
  assert.same(box.Array.from([1]), 'WRITTEN-SLOT');
});
