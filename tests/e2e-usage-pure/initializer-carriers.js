QUnit.test('initializer carriers keep nested prefixes in their sole dispatch', assert => {
  const effects = [];
  function outer() { effects.push('outer'); }
  function inner() { effects.push('inner'); }
  // eslint-disable-next-line @stylistic/no-extra-parens -- keep the nested sequence under test
  const { prototype: { at: method } } = (outer(), (inner(), Array));
  assert.same(method.call([4, 9], -1), 9);
  assert.deepEqual(effects, ['outer', 'inner']);
});

QUnit.test('initializer carriers share a call after an extracted sibling', assert => {
  const effects = [];
  function getRows() {
    effects.push('receiver');
    return [4, 9];
  }
  const { Array: { from } } = globalThis,
        { at, concat } = getRows();
  assert.deepEqual(from([1]), [1]);
  assert.same(at.call([4, 9], -1), 9);
  assert.deepEqual(concat.call([4, 9], [2]), [4, 9, 2]);
  assert.deepEqual(effects, ['receiver']);
});

QUnit.test('initializer carriers keep the store used by a symbol read', assert => {
  const effects = [];
  let held;
  const { [Symbol.iterator]: iterator } = held = (effects.push('prefix'), Array.prototype);
  assert.same(iterator.call([4, 9]).next().value, 4);
  assert.same(held, Array.prototype);
  assert.deepEqual(effects, ['prefix']);
});

QUnit.test('initializer carriers preserve one store and prefix before several reads', assert => {
  const effects = [];
  let held;
  const { Array: { prototype: { at: method, includes: contains } } } = held = (effects.push('prefix'), globalThis);
  assert.same(method.call([4, 9], -1), 9);
  assert.same(contains.call([4, 9], 9), true);
  assert.same(held, globalThis);
  assert.deepEqual(effects, ['prefix']);
});

QUnit.test('initializer carriers keep prefix evaluation in a bodyless control slot', assert => {
  const effects = [];
  function read(enabled) {
    // eslint-disable-next-line no-var -- a lexical declaration cannot occupy a bodyless slot
    if (enabled) var { Array: { prototype: { at: method, includes: contains } } } = (effects.push('prefix'), globalThis);
    return enabled ? [method.call([4, 9], -1), contains.call([4, 9], 9)] : method;
  }
  assert.same(read(false), undefined);
  assert.deepEqual(effects, []);
  assert.deepEqual(read(true), [9, true]);
  assert.deepEqual(effects, ['prefix']);
});

QUnit.test('initializer carriers preserve loop initialization order', assert => {
  const effects = [];
  let held;
  for (let { Array: { prototype: { at: method, includes: contains } } } = held = (effects.push('prefix'), globalThis),
           once = (effects.push('test-init'), true); once; once = false) {
    effects.push('body');
    assert.same(method.call([4, 9], -1), 9);
    assert.same(contains.call([4, 9], 9), true);
  }
  assert.same(held, globalThis);
  assert.deepEqual(effects, ['prefix', 'test-init', 'body']);
});

QUnit.test('initializer carriers preserve preceding declarators and early throws', assert => {
  const effects = [];
  const rows = [4, 9];
  function read(throws) {
    const source = { get data() {
      effects.push('getter');
      if (throws) throw new Error('stop');
      return rows;
    } };
    const lead = (effects.push('lead'), 1),
          { data: { at: method } } = (effects.push('prefix'), source),
          tail = (effects.push('tail'), 2);
    return [lead, method.call(rows, -1), tail];
  }
  assert.deepEqual(read(false), [1, 9, 2]);
  assert.deepEqual(effects, ['lead', 'prefix', 'getter', 'tail']);
  effects.length = 0;
  assert.throws(() => read(true), Error);
  assert.deepEqual(effects, ['lead', 'prefix', 'getter']);
});
