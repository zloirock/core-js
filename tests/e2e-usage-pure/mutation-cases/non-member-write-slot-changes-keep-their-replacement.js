
// the slot-write family that never spells a member write still replaces what the container's slot
// holds - a mutator call, a callee that may write, a delete, a dynamic key. each must keep the
// program's replacement winning over the polyfill; no global is touched, so nothing to restore
QUnit.test('mutated-statics: non-member-write slot changes keep their replacement', assert => {
  const viaAssign = { k: Array };
  Object.assign(viaAssign, { k: { of: () => 'ASSIGN' } });
  const { k: { of: assignOf } } = viaAssign;
  assert.same(assignOf(1), 'ASSIGN');
  const viaClosure = { k: Array };
  (function poison(target) { target.k = { of: () => 'CLOSURE' }; })(viaClosure);
  const { k: { of: closureOf } } = viaClosure;
  assert.same(closureOf(1), 'CLOSURE');
  const viaDynamic = { k: Array };
  const dynamicKey = 'k';
  viaDynamic[dynamicKey] = { of: () => 'DYNAMIC' };
  const { k: { of: dynamicOf } } = viaDynamic;
  assert.same(dynamicOf(1), 'DYNAMIC');
  const viaDelete = { k: Array };
  delete viaDelete.k;
  const { k: deletedSlot } = viaDelete;
  assert.same(deletedSlot, undefined);
});
