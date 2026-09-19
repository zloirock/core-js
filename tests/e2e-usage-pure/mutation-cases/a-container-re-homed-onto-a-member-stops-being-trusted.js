
// a container RE-HOMED onto a member (`registry.ref = box`) hands its reference to a path whose
// writes never spell the container's name, so the literal stops being trusted - the same escape a
// call argument makes. before the fix only the argument spelling escaped, and a write through the
// new path was invisible: the read substituted off the literal's initial member
QUnit.test('mutated-statics: a container re-homed onto a member stops being trusted', assert => {
  const box = { Array };
  const registry = { ref: null };
  registry.ref = box;
  registry.ref.Array = { from: () => 'RE-HOMED' };
  assert.same(box.Array.from([1]), 'RE-HOMED');
});
