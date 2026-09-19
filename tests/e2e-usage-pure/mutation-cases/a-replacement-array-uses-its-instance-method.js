
QUnit.test('mutated-statics: a replacement array uses its instance method', assert => {
  const slot = [globalThis.Array];
  slot[0] = [8];
  assert.same(slot[0].at(0), 8);
});
