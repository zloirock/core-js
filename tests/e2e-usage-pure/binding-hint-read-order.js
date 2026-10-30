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
