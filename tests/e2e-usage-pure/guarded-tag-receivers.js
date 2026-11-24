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

QUnit.test('guarded tag evaluates substitutions after its getter and before a call failure', assert => {
  const events = [];
  let C = Array;
  const user = { get of() {
    events.push('get');
    C = Array;
    return method;
  } };
  let method = null;
  function call(builtin) {
    C = builtin ? Array : user;
    return C.of`part${ events.push('sub') }`;
  }
  assert.throws(() => call(false), TypeError);
  assert.deepEqual(events, ['get', 'sub']);
  let first;
  method = function (strings) {
    assert.same(this, user);
    if (first) assert.same(strings, first);
    first = strings;
    return 7;
  };
  assert.same(call(false), 7);
  assert.same(call(false), 7);
  assert.deepEqual(events, ['get', 'sub', 'get', 'sub', 'get', 'sub']);
});

QUnit.test('an optional member used as a tag retains its receiver', assert => {
  const list = [];
  list.at = function () { return this === list; };
  // eslint-disable-next-line no-unsafe-optional-chaining -- the sealed optional is the receiver under test
  assert.true((list?.at)`hello`);
});
