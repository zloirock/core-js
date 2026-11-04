QUnit.test('a later alias write cannot narrow an earlier read or a nested shadow', assert => {
  // eslint-disable-next-line prefer-const -- the read must precede the assignment
  let held;
  assert.same(held?.toStringTag, undefined, 'the alias has not been assigned yet');
  ({ Symbol: held } = globalThis);
  assert.same(held.iterator, Symbol.iterator, 'the completed assignment supplies the symbol');
  // eslint-disable-next-line no-shadow -- the parameter must shadow the registered alias
  function read(held) {
    return held.iterator;
  }
  assert.same(read({ iterator: 'own' }), 'own', 'the parameter keeps its own property');
});

QUnit.test('a guarded alias keeps both its empty and initialized values', assert => {
  for (const present of [false, true]) {
    let held;
    if (present) ({ Symbol: held } = globalThis);
    assert.same(held?.iterator, present ? Symbol.iterator : undefined);
  }
});

QUnit.test('an earlier alias read keeps the receiver of a reachable guarded write', assert => {
  const calls = [];
  const other = { of(value) {
    calls.push(this === other);
    return [value + 1];
  } };
  function read(useMap, prime) {
    let a = Object;
    let b = useMap ? Map : null;
    let c = Array;
    if (!b && !c) a = other;
    if (!a) b = other;
    if (!b) c = other;
    if (prime) assert.same(a.unrelated, undefined);
    return c.of(7)[0];
  }
  for (const prime of [false, true]) {
    assert.same(read(true, prime), 7);
    assert.same(read(false, prime), 8);
  }
  assert.deepEqual(calls, [true, true]);
});
