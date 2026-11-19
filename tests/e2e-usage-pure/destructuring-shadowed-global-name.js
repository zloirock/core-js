// a mirror re-reads a receiver valued as a global by that global's name where its literal stands, so a binding
// of the name there must not answer for it: the slots the mirror passes through read the realm's own value
QUnit.test('shadowed global name: a parameter of the name leaves the mirrored reads to the realm', assert => {
  function read(Array) {
    const { a: { from, prototype } } = { a: globalThis.Array };
    return [from, prototype, Array];
  }
  // eslint-disable-next-line no-unused-vars -- retain static slots without requiring wrapper polyfills
  const [from, prototype, shadow] = read({ prototype: 'shadow' });
  assert.same(prototype, Array.prototype);
  assert.same(shadow.prototype, 'shadow');
});

QUnit.test('shadowed global name: a local of the name leaves the mirrored reads to the realm', assert => {
  const { prototype: expected } = Object;
  {
    const Object = { prototype: 'shadow' };
    // eslint-disable-next-line no-unused-vars -- retain static slots without requiring wrapper polyfills
    const { a: { fromEntries, prototype } } = { a: globalThis.Object };
    assert.same(prototype, expected);
    assert.same(Object.prototype, 'shadow');
  }
});

QUnit.test('shadowed global name: an extracted instance method stays local', assert => {
  function read(row) {
    const { at: Map, flat } = row;
    return [Map.call(row, -1), typeof flat];
  }
  assert.deepEqual(read([3, 7]), [7, 'function']);
});

QUnit.test('destructuring: extracted and residual bindings keep loop captures', assert => {
  const handlers = [];
  function register(rows) {
    for (const row of rows) {
      const { name, find } = row;
      handlers.push(() => [name, find()]);
    }
  }
  register([{ name: 'a', find: () => 1 }, { name: 'b', find: () => 2 }]);
  assert.deepEqual(handlers.map(handler => handler()), [['a', 1], ['b', 2]]);
});
