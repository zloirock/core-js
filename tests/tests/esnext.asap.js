QUnit.test('asap', assert => {
  assert.expect(5);
  assert.isFunction(asap);
  assert.arity(asap, 1);
  assert.name(asap, 'asap');
  assert.looksNative(asap);
  const async = assert.async();
  let done = false;
  let after = false;
  asap(() => {
    if (!done) {
      done = true;
      assert.ok(after, 'works');
      async();
    }
  });
  setTimeout(() => {
    if (!done) {
      done = true;
      assert.ok(false, 'fails');
      async();
    }
  }, 3e3);
  after = true;
});
