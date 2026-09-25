// a slot WRITTEN through a binding of the container an invocation yields no longer holds what the
// callee's literal spells - a slot the callee fills from a parameter included, and whatever spelling
// the invocation takes (a call, a tag, a `new`, an `await`): every read of it lands on the
// replacement, never on the polyfilled static of the literal's constructor
/* eslint-disable es/no-async-functions -- safe */
QUnit.test('mutated-statics: a written parameter slot of a call-yielded container wins', assert => {
  function make(x) { return [x, 0]; }
  const w = make(Array);
  w[0] = { from: () => 'WRITTEN' };
  assert.same(w[0].from([1]), 'WRITTEN');
  const [{ from } = {}] = w;
  assert.same(from([1]), 'WRITTEN');
});

QUnit.test('mutated-statics: a parameter slot handed out to a writer wins', assert => {
  function make(x) { return [x, 0]; }
  const w = make(Array);
  (function put(target) { target[0] = { of: () => 'HANDED' }; })(w);
  assert.same(w[0].of(1), 'HANDED');
});

QUnit.test('mutated-statics: a written slot of a tag-yielded container wins', assert => {
  function tag() { return [Array, 0]; }
  const w = tag`x`;
  w[0] = { isArray: () => 'TAGGED' };
  assert.same(w[0].isArray([]), 'TAGGED');
  const [{ isArray } = {}] = w;
  assert.same(isArray([]), 'TAGGED');
});

QUnit.test('mutated-statics: a written slot of a constructor-yielded container wins', assert => {
  function Make() { return [Object, 0]; }
  const w = new Make();
  w[0] = { fromEntries: () => 'CONSTRUCTED' };
  assert.same(w[0].fromEntries([]), 'CONSTRUCTED');
  const [{ fromEntries } = {}] = w;
  assert.same(fromEntries([]), 'CONSTRUCTED');
});

QUnit.test('mutated-statics: a written slot of an awaited container wins', assert => {
  const done = assert.async();
  function make() { return [Object, 0]; }
  (async () => {
    const w = await make();
    w[0] = { entries: () => 'AWAITED' };
    assert.same(w[0].entries({}), 'AWAITED');
    done();
  })();
});
