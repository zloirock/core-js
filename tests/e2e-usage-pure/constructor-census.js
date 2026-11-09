QUnit.test('constructor census: a class barrier retains the stored namespace', assert => {
  const effects = [];
  class C {
    static M = Map;
    static { effects.push('block'); }
  }
  assert.deepEqual(C.M.groupBy([1, 3, 2], value => value % 2).get(1), [1, 3]);
  assert.deepEqual(effects, ['block']);
});

QUnit.test('constructor census: a static accessor pair reads the getter once', assert => {
  const effects = [];
  // eslint-disable-next-line unicorn/no-static-only-class -- exercise the class accessor pairing
  class C {
    static get M() { effects.push('get'); return Map; }
    static set M(value) { effects.push('set'); }
  }
  const { M: { groupBy } } = C;
  assert.deepEqual(groupBy([4, 5], value => value % 2).get(0), [4]);
  assert.deepEqual(effects, ['get']);
});

QUnit.test('constructor census: keys outside the claim canon keep their native reads', assert => {
  for (const key of ['groupBy']) assert.deepEqual(Map[key]([7], value => value).get(7), [7]);
  const { key } = { key: 'groupBy' };
  assert.deepEqual(Map[key]([8], value => value).get(8), [8]);
  let conditional;
  if (key) conditional = 'groupBy';
  assert.deepEqual(Map[conditional]([10], value => value).get(10), [10]);
});

QUnit.test('constructor census: an exported accessor keeps the returned namespace', assert => {
  const api = {};
  const effects = [];
  Object.defineProperties(api, {
    M: { get() { effects.push('get'); return Map; } },
  });
  assert.deepEqual(api.M.groupBy([9], value => value).get(9), [9]);
  assert.deepEqual(effects, ['get']);
});

QUnit.test('constructor census: an unknown class key retains the guarded receiver', assert => {
  const effects = [];
  const source = {
    get key() { effects.push('key'); return 'P'; },
  };
  // eslint-disable-next-line unicorn/no-static-only-class -- exercise the class candidate guard
  class C {
    static P = Array;
    static [source.key] = Iterator;
  }
  const { P: { from } } = C;
  assert.deepEqual([...from([3, 4])], [3, 4]);
  assert.deepEqual(effects, ['key']);
});
