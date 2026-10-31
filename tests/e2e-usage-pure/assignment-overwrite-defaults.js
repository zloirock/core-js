QUnit.test('a retained keyed assignment reads its already evaluated default', assert => {
  const effects = [];
  function fallback() {
    effects.push('default');
    return 17;
  }
  let method;
  // eslint-disable-next-line prefer-const -- exercise the assignment host
  ({ [(effects.push('key'), Symbol.iterator)]: method = fallback() } = globalThis);
  assert.same(method, 17);
  assert.deepEqual(effects, ['key', 'default']);
});

QUnit.test('a pruned assignment reads its getter and default once', assert => {
  const effects = [];
  const receiver = { get at() {
    effects.push('getter');
    return undefined;
  } };
  function fallback() {
    effects.push('default');
    return 23;
  }
  let method;
  // eslint-disable-next-line prefer-const -- exercise the assignment host
  ({ slot: { at: method = fallback() } } = { slot: receiver });
  assert.same(method, 23);
  assert.deepEqual(effects, ['getter', 'default']);
});

QUnit.test('a throwing assignment getter does not evaluate its default', assert => {
  const effects = [];
  const receiver = { get at() {
    effects.push('getter');
    throw new Error('stop');
  } };
  let method = 'before';
  assert.throws(() => {
    ({ slot: { at: method = (effects.push('default'), 23) } } = { slot: receiver });
  }, Error);
  assert.same(method, 'before');
  assert.deepEqual(effects, ['getter']);
});

QUnit.test('a defined falsy assignment value does not evaluate its default', assert => {
  const effects = [];
  const receiver = { get at() {
    effects.push('getter');
    return 0;
  } };
  let method;
  // eslint-disable-next-line prefer-const -- exercise the assignment host
  ({ slot: { at: method = (effects.push('default'), 23) } } = { slot: receiver });
  assert.same(method, 0);
  assert.deepEqual(effects, ['getter']);
});

// Babel's ES5 lowering loses this inferred name without any core-js plugin too.
// Keep the native expectation; the differential suite checks the pre-lowering form.
QUnit.todo('an assignment default keeps its nested polyfill and inferred name', assert => {
  let method;
  // eslint-disable-next-line prefer-const -- exercise the assignment host
  ({ slot: { at: method = () => Array.from([4, 9]).at(-1) } } = { slot: {} });
  assert.same(method(), 9);
  assert.same(method.name, 'method');
});

QUnit.test('a member overwrite preserves getter default and setter order', assert => {
  const effects = [];
  const receiver = { get at() {
    effects.push('getter');
    return undefined;
  } };
  let stored;
  const target = { set method(value) {
    effects.push('setter');
    stored = value;
  } };
  ({ slot: { at: target.method = (effects.push('default'), 29) } } = { slot: receiver });
  assert.same(stored, 29);
  assert.deepEqual(effects, ['getter', 'default', 'setter']);
});

QUnit.test('a bodyless overwrite keeps its key and default inside the branch', assert => {
  const effects = [];
  function read(enabled) {
    let method = 'before';
    if (enabled) ({ [(effects.push('key'), Symbol.iterator)]: method = (effects.push('default'), 31) } = globalThis);
    return method;
  }
  assert.same(read(false), 'before');
  assert.deepEqual(effects, []);
  assert.same(read(true), 31);
  assert.deepEqual(effects, ['key', 'default']);
});

QUnit.test('a discarded assignment keeps its default before the following effect', assert => {
  const effects = [];
  let method;
  const after = ({ slot: { at: method = (effects.push('default'), 37) } } = { slot: {} }, effects.push('after'));
  assert.same(method, 37);
  assert.same(after, 2);
  assert.deepEqual(effects, ['default', 'after']);
});

QUnit.test('a discarded keyed overwrite uses its retained binding before the next effect', assert => {
  const effects = [];
  let method;
  // eslint-disable-next-line no-sequences -- keep the discarded assignment position
  ({ [(effects.push('key'), Symbol.iterator)]: method = (effects.push('default'), 41) } = globalThis), effects.push('after');
  assert.same(method, 41);
  assert.deepEqual(effects, ['key', 'default', 'after']);
});

QUnit.test('an overwrite over a receiver parameter reads its live default once', assert => {
  const effects = [];
  function read(receiver) {
    let method;
    // eslint-disable-next-line prefer-const -- exercise the assignment host
    ({ slot: { at: method = Array.from([4, 9], value => {
      effects.push('default');
      return value;
    }).at(-1) } } = { slot: receiver });
    return method;
  }
  assert.same(read({ get at() {
    effects.push('getter');
    return undefined;
  } }), 9);
  assert.deepEqual(effects, ['getter', 'default', 'default']);
});
