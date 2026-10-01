QUnit.test('positional types: constructor and realm heads retain both prototype leaves', assert => {
  for (const R of [Array, Array]) {
    const { prototype: { at, includes } } = R;
    assert.same(at.call([1, 2], -1), 2);
    assert.false(includes.call([0, 2], '02'));
  }
  for (const { w: { prototype: { at, includes } } } of [{ w: Array }]) {
    assert.same(at.call([3, 4], -1), 4);
    assert.false(includes.call([0, 2], '02'));
  }
  let at, includes;
  for ({ Array: { prototype: { at, includes } } } of [globalThis]) {
    assert.same(at.call([5, 6], -1), 6);
    assert.false(includes.call([0, 2], '02'));
  }
});

QUnit.test('positional types: later leaves and later iterations keep their own families', assert => {
  const rows = [[1, 2], '02'];
  for (const [{ at }, { includes }] of [rows]) {
    assert.same(at.call(rows[0], -1), 2);
    assert.true(includes.call(rows[1], '0'));
  }
  const result = [];
  const mixed = [[[1, 2], '02'], ['02', [0, 2]], [[3, 4], '12']];
  let index = 0;
  for (const [{ at }, { includes }] of mixed) {
    const [left, right] = mixed[index++];
    result.push(at.call(left, -1), includes.call(right, '0'));
  }
  assert.deepEqual(result, [2, true, '2', false, 4, false]);
});

QUnit.test('positional types: rebinding preserves captures while field writes reach them', assert => {
  let box = { y: { at: 1 } };
  const [{ y: { at } }, tail] = [box, box = { y: { at: 9 } }];
  assert.deepEqual([at, tail.y.at], [1, 9]);
  assert.same(tail, box);
  let array = [1, 2];
  const [savedArray] = [array];
  array = '02';
  assert.same(savedArray.at(-1), 2);
  assert.same(array, '02');
  let string = '02';
  const [savedString] = [string];
  string = [0, 2];
  assert.true(savedString.includes('0'));
  assert.deepEqual(string, [0, 2]);
  const source = { y: [0, 2] };
  const [saved] = [source];
  const alias = saved;
  alias.y = '02';
  assert.true(saved.y.includes('0'));
  const elements = [[0, 2]];
  elements[0] = '02';
  const [element] = elements;
  assert.true(element.includes('0'));
});

QUnit.test('positional types: captures use the value from each activation', assert => {
  let value = [0, 2];
  const iterations = [];
  for (let i = 0; i < 2; i++) {
    const [saved] = [value];
    iterations.push(saved.at(-1), saved.includes('02'));
    value = '02';
  }
  assert.deepEqual(iterations, [2, false, '2', true]);
  let source = [0, 2];
  function read() {
    const [saved] = [source];
    source = '02';
    return [saved.at(-1), saved.includes('02')];
  }
  assert.deepEqual([read(), read()], [[2, false], ['2', true]]);
  let outer = [0, 2];
  const [captured] = [outer];
  outer = '02';
  assert.false((() => captured.includes('02'))());
  assert.same(outer, '02');
});

QUnit.test('positional types: loop element fields use their current values', assert => {
  const row = { w: [0, 2] };
  row.w = '02';
  for (const { w: { at, includes } } of [row]) {
    assert.same(at.call('02', -1), '2');
    assert.true(includes.call('02', '02'));
  }
  const aliased = { w: [0, 2] };
  const alias = aliased;
  alias.w = '02';
  for (const { w: { includes } } of [aliased]) assert.true(includes.call('02', '02'));
  // eslint-disable-next-line sonarjs/prefer-object-literal -- exercise a field absent from the initializer
  const added = {};
  added.w = '02';
  for (const { w: { includes } = [0, 2] } of [added]) assert.true(includes.call('02', '02'));
});

QUnit.test('positional types: relocated rest remains an object with the claimed key excluded', assert => {
  // eslint-disable-next-line no-var -- retain the source-binding form whose loop head is relocated
  for (var { from, ...staticRest } of [Array]) {
    assert.deepEqual(from([1]), [1]);
    assert.false('from' in staticRest);
  }
  // eslint-disable-next-line no-var -- retain the source-binding form whose loop head is relocated
  for (var { at, ...instanceRest } of [[1, 2]]) {
    // Instance-rest reads stay native; a post-lowering leg may serve the lowered read.
    assert.true(['undefined', 'function'].includes(typeof at));
    assert.false('at' in instanceRest);
    assert.deepEqual(instanceRest, { 0: 1, 1: 2 });
  }
});

QUnit.test('positional types: opaque captures retain guards, calls and key effects', assert => {
  function readHead(flag, unknown) {
    let result;
    for (const R of [flag ? Array : unknown]) {
      const { prototype: { at, length }, from } = R;
      result = [at.call([1, 2], -1), length, from([3])[0]];
    }
    return result;
  }
  const custom = { prototype: { at: () => 7, length: 3 }, from: () => [8] };
  assert.deepEqual(readHead(true, custom), [2, 0, 3]);
  assert.deepEqual(readHead(false, custom), [7, 3, 8]);
  function readWrapper(unknown) {
    const log = [];
    let result;
    for (const e of [Array]) {
      const [{ [(log.push('key'), 'of')]: of, from }, { at, length }] = [e, unknown];
      result = [of(4), from([5]), at.call(unknown, -1), length, log];
    }
    return result;
  }
  assert.deepEqual(readWrapper([6]), [[4], [5], 6, 1, ['key']]);
  assert.deepEqual(readWrapper('xy'), [[4], [5], 'y', 2, ['key']]);
  function readEffect(unknown) {
    const log = [];
    function make() {
      log.push('make');
      return Array;
    }
    let result;
    for (const { from, prototype: { at, length } = unknown } of [make()]) {
      result = [from([9]), at.call([1, 2], -1), length, log];
    }
    return result;
  }
  assert.deepEqual(readEffect(custom.prototype), [[9], 2, 0, ['make']]);
});
