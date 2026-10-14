// a mirror re-reads a receiver valued as a global by that global's name where its literal stands, so a binding
// of the name there must not answer for it: the slots the mirror passes through read the realm's own value
QUnit.test('shadowed global name: a parameter of the name leaves the mirrored reads to the realm', assert => {
  function read(Array) {
    const { a: { from, prototype } } = { a: globalThis.Array };
    return [from, prototype, Array];
  }
  const [from, prototype, shadow] = read({ prototype: 'shadow' });
  assert.deepEqual(from('ab'), ['a', 'b']);
  assert.same(prototype, Array.prototype);
  assert.same(shadow.prototype, 'shadow');
});

QUnit.test('shadowed global name: a local of the name leaves the mirrored reads to the realm', assert => {
  const { prototype: expected } = Object;
  {
    const Object = { prototype: 'shadow' };
    const { a: { fromEntries, prototype } } = { a: globalThis.Object };
    assert.deepEqual(fromEntries([['a', 1]]), { a: 1 });
    assert.same(prototype, expected);
    assert.same(Object.prototype, 'shadow');
  }
});
