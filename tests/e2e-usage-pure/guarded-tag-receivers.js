function read(flag, fallback) {
  let C;
  flag ? { Promise: C } = globalThis : C = fallback;
  return C.withResolvers`x`;
}

function detached(flag, fallback) {
  let C;
  flag ? { Promise: C } = globalThis : C = fallback;
  return (0, C.withResolvers)`x`;
}

QUnit.test('guarded tags: user methods keep their receiver only when attached', assert => {
  const user = { marker: 7, withResolvers() { return this.marker; } };
  assert.same(read(false, user), 7);
  assert.throws(() => detached(false, user), TypeError);
});
