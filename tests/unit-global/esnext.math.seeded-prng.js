QUnit.test('Math.seededPRNG', assert => {
  const { seededPRNG } = Math;
  assert.isFunction(seededPRNG);
  assert.name(seededPRNG, 'seededPRNG');
  assert.arity(seededPRNG, 1);
  assert.looksNative(seededPRNG);
  assert.nonEnumerable(Math, 'seededPRNG');

  for (const gen of [seededPRNG({ seed: 42 }), seededPRNG({ seed: 42 })]) {
    assert.deepEqual(gen.next(), { value: 0.16461519912315087, done: false });
    assert.deepEqual(gen.next(), { value: 0.2203933906000046, done: false });
    assert.deepEqual(gen.next(), { value: 0.8249682894209105, done: false });
    assert.deepEqual(gen.next(), { value: 0.10750079537509083, done: false });
    assert.deepEqual(gen.next(), { value: 0.004673248161257476, done: false });
  }

  for (const gen of [seededPRNG({ seed: 43 }), seededPRNG({ seed: 43 })]) {
    assert.deepEqual(gen.next(), { value: 0.1923438591811283, done: false });
    assert.deepEqual(gen.next(), { value: 0.7896811578326683, done: false });
    assert.deepEqual(gen.next(), { value: 0.9518230761883996, done: false });
    assert.deepEqual(gen.next(), { value: 0.1414634102410296, done: false });
    assert.deepEqual(gen.next(), { value: 0.7379838030207752, done: false });
  }

  assert.throws(() => seededPRNG(), TypeError);
  assert.throws(() => seededPRNG(5), TypeError);
  assert.throws(() => seededPRNG({ seed: null }), TypeError);
});
