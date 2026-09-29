QUnit.test('constructor selections: conditional pattern aliases retain raw static reads', assert => {
  let M;
  if (assert) ({ Map: M } = globalThis);
  assert.true('groupBy' in M);

  let P;
  if (assert) ({ Promise: P } = globalThis);
  function read({ try: method } = P) { return typeof method; }
  assert.same(read(), 'function');

  let S;
  if (assert) ({ Symbol: S } = globalThis);
  const { iterator: value = 'fallback' } = S;
  // Symbol is object-backed on engines without native symbols.
  assert.same(value, Symbol.iterator);
});

QUnit.test('constructor selections: a closure before its realm initializer keeps statics', assert => {
  function read() { return realm.Promise.resolve(7); }
  // eslint-disable-next-line no-var -- the pre-initializer closure exercises a hoisted binding
  var realm = globalThis;
  return read().then(value => assert.same(value, 7));
});

QUnit.test('constructor selections: captured intrinsic sibling keeps the static and identity', assert => {
  function read(source) {
    let name, groupBy;
    const host = { name, groupBy } = source || Map;
    return [host, typeof name, groupBy];
  }
  const builtin = read(null);
  assert.same(builtin[0], Map);
  assert.same(builtin[1], 'string');
  assert.same(typeof builtin[2], 'function');
  assert.deepEqual(builtin[2]([7], value => value).get(7), [7]);
  const user = { name: 'user', groupBy: 9 };
  assert.deepEqual(read(user), [user, 'string', 9]);
});

QUnit.test('constructor selections: opaque keys keep native statics as an accepted pure boundary', assert => {
  function read(array, key) {
    let C = Object;
    if (array) C = Array;
    return C[key];
  }
  assert.same(read(true, 'from'), Object.getOwnPropertyDescriptor(Array, 'from')?.value);
  assert.same(read(false, 'groupBy'), Object.getOwnPropertyDescriptor(Object, 'groupBy')?.value);
});

QUnit.test('constructor selections: captured realm assignments keep the realm and polyfill the alias', assert => {
  function read(enabled) {
    let C;
    const realm = enabled && ({ Map: C } = globalThis);
    if (!enabled) return [realm, C];
    const { groupBy: method = 'fallback' } = C;
    return [realm, method];
  }
  const [realm, method] = read(true);
  assert.same(realm, globalThis);
  assert.deepEqual(method([7], value => value).get(7), [7]);
  assert.deepEqual(read(false), [false, undefined]);
});

QUnit.test('constructor selections: aliases keep separate receiver cache domains', assert => {
  function read(flag) {
    const { Map: M } = globalThis;
    const box = { x: flag ? M : Math };
    const first = 'groupBy' in box.x;
    let C = M;
    if (flag) C = Math;
    return [first, 'groupBy' in C];
  }
  assert.deepEqual(read(true), [true, false]);
  assert.deepEqual(read(false), [false, true]);
});

QUnit.test('constructor selections: an opaque selected source can replace the realm', assert => {
  function read(flag, factory) {
    // eslint-disable-next-line no-useless-assignment -- the initial realm must not prove an opaque later value
    let realm = globalThis;
    ({ value: realm } = flag ? { value: globalThis } : factory());
    return [realm === globalThis, realm.Array.from([7])[0]];
  }
  function makeUserRealm() { return { value: { Array: { from: () => [9] } } }; }
  assert.deepEqual(read(true, makeUserRealm), [true, 7]);
  assert.deepEqual(read(false, makeUserRealm), [false, 9]);
});
