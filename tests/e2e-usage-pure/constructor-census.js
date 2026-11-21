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

// Each syntactic write counts toward the analysis ceiling, even with the same value.
/* eslint-disable no-useless-assignment -- the separate writes exercise the claim ceiling */
QUnit.test('constructor census: a read past the write ceiling keeps its static', assert => {
  let C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  C = Map;
  assert.deepEqual(C.groupBy([3, 7], value => value % 2).get(1), [3, 7]);
});

QUnit.test('an instance constructor can call the same static with a different receiver', assert => {
  const log = [];
  // eslint-disable-next-line unicorn/no-static-only-class -- the instance exposes the static through its constructor
  class Reader {
    static read(source) { return source.from([1])[0]; }
  }
  const reader = new Reader();
  const custom = {
    get from() {
      log.push('get');
      return function () { return [this.value]; };
    },
    value: 9,
  };
  function callAgain(key) { return reader[key].read(custom); }
  assert.strictEqual(Reader.read(Array), 1);
  assert.strictEqual(callAgain('constructor'), 9);
  assert.deepEqual(log, ['get']);
});

QUnit.test('constructing again selects the parameter default at each call', assert => {
  const log = [];
  const first = new function ({ from, [(log.push('key'), 'name')]: extra } = Array) {
    this.read = () => typeof from === 'function' ? from([1])[0] : typeof from;
    this.extra = extra;
  }();
  const Again = first.constructor;
  const supplied = new Again({
    get from() { log.push('get'); return () => [9]; },
    name: 4,
  });
  assert.deepEqual([first.read(), supplied.read(), supplied.extra, new Again(undefined).read(), new Again({}).read()],
    [1, 9, 4, 1, 'undefined']);
  assert.deepEqual(log, ['key', 'get', 'key', 'key', 'key']);
});

QUnit.test('instance super calls the inherited Set union method', assert => {
  class Bag extends Set {
    join(other) { return super.union(other); }
  }
  const bag = new Bag([1]);
  assert.deepEqual([...bag.join(new Set([2]))], [1, 2]);
  assert.deepEqual([...bag], [1]);
});
