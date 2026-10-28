/* eslint-disable @stylistic/no-extra-parens -- nested sequences are the source boundary under test */
QUnit.test('destructuring: kept realm writes preserve the value and initializer order', assert => {
  const events = [];
  let held, other;
  const { from: read } = (held = other = (events.push('value'), globalThis)).Array;
  events.push('bound');
  assert.same(held, globalThis);
  assert.same(other, globalThis);
  assert.deepEqual(read([7]), [7]);
  assert.deepEqual(events, ['value', 'bound']);
});

QUnit.test('destructuring: a getter inside a kept write runs before its static read', assert => {
  // The opaque getter keeps the native lookup, including its miss in a stripped realm.
  // It does not promise static inference through the getter result.
  const nativeRead = Function('return Array.from')();
  const events = [];
  const source = { get realm() {
    events.push('get');
    return globalThis;
  } };
  let held;
  const { from: read } = (held = (events.push('value'), source.realm)).Array;
  events.push('bound');
  assert.same(held, globalThis);
  assert.same(read, nativeRead);
  if (nativeRead) assert.deepEqual(read([7]), [7]);
  else assert.throws(() => read([7]), TypeError);
  assert.deepEqual(events, ['value', 'get', 'bound']);
});

QUnit.test('global-proxy: a retained nested sequence keeps a shadowed getter and both prefixes', assert => {
  const events = [];
  const realm = { get self() {
    events.push('get');
    return { keptValue: 7 };
  } };
  function read(globalThis) {
    return (events.push('outer'), (events.push('inner'), globalThis.self))?.keptValue;
  }
  assert.same(read(realm), 7);
  assert.deepEqual(events, ['outer', 'inner', 'get']);
});
