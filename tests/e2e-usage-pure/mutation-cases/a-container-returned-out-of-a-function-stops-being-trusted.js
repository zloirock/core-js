
// ... and the same escape through a RETURN: the caller holds the reference, and its writes spell
// nothing this file can see
QUnit.test('mutated-statics: a container returned out of a function stops being trusted', assert => {
  const box = { Array };
  function hand() { return box; }
  hand().Array = { from: () => 'RETURNED' };
  assert.same(box.Array.from([1]), 'RETURNED');
});
