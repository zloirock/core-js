QUnit.test('a function type stays neutralized while a field memo acquires its scope', assert => {
  const o: { p?: number[] } | undefined = JSON.parse('{"p":[4,8]}');
  const cb = (..._args: unknown[]) => {};
  class Box {
    value = [o?.p?.at(-1), cb as (...xs: number[]) => void];
  }
  assert.same(new Box().value[0], 8);
});

QUnit.test('a function type stays neutralized while a parameter memo acquires its scope', assert => {
  const o: { p?: number[] } | undefined = JSON.parse('{"p":[4,8]}');
  const cb = (..._args: unknown[]) => {};
  function read(value = [o?.p?.at(-1), cb as ({ x }: { x: number }) => void]) {
    return value[0];
  }
  assert.same(read(), 8);
});
