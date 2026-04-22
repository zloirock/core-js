// --- private instance fields holding polyfilled collections ---

QUnit.test('private fields: init via Array.from, access via Array.prototype.at', assert => {
  class Ring {
    #data;
    constructor(xs) { this.#data = Array.from(xs); }
    head() { return this.#data.at(0); }
    tail() { return this.#data.at(-1); }
  }
  const r = new Ring(new Set([3, 1, 2, 1, 3]));
  assert.same(r.head(), 3);
  assert.same(r.tail(), 2);
});

QUnit.test('private fields: Map polyfill stored in #field, accessed via private method', assert => {
  class Registry {
    #entries = new Map();
    #hits = new Map();
    set(key, value) {
      this.#entries.set(key, value);
      this.#hits.set(key, (this.#hits.get(key) ?? 0) + 1);
    }
    lookup(key) { return this.#entries.get(key); }
    hitCount(key) { return this.#hits.get(key) ?? 0; }
  }
  const r = new Registry();
  r.set('a', 1);
  r.set('b', 2);
  // re-set intentionally increments the hit counter; the double set IS the test surface
  // eslint-disable-next-line sonarjs/no-element-overwrite -- testing hitCount increment on re-set
  r.set('a', 3);
  assert.same(r.lookup('a'), 3);
  assert.same(r.lookup('b'), 2);
  assert.same(r.hitCount('a'), 2);
  assert.same(r.hitCount('b'), 1);
});

QUnit.test('private fields: Set polyfill used for deduplication inside private method', assert => {
  class Dedupe {
    #seen = new Set();
    push(x) {
      if (this.#seen.has(x)) return false;
      this.#seen.add(x);
      return true;
    }
    size() { return this.#seen.size; }
  }
  const d = new Dedupe();
  assert.true(d.push(1));
  assert.true(d.push(2));
  assert.false(d.push(1));
  assert.same(d.size(), 2);
});

// --- private methods returning polyfilled values ---

QUnit.test('private methods: return polyfilled Map, caller consumes via for-of destructure', assert => {
  class WordCount {
    constructor(words) { this.words = words; }
    #histogram() {
      const m = new Map();
      for (const w of this.words) m.set(w, (m.get(w) ?? 0) + 1);
      return m;
    }
    topPairs() {
      const pairs = [];
      for (const [word, count] of this.#histogram()) pairs.push({ word, count });
      return pairs.sort((a, b) => b.count - a.count);
    }
  }
  const wc = new WordCount(['a', 'b', 'a', 'c', 'a', 'b']);
  assert.deepEqual(wc.topPairs(), [
    { word: 'a', count: 3 },
    { word: 'b', count: 2 },
    { word: 'c', count: 1 },
  ]);
});

QUnit.test('private methods: Array.from inside #private consumed by public method', assert => {
  class Reversed {
    #src;
    constructor(src) { this.#src = src; }
    #normalize() { return Array.from(this.#src); }
    asReversed() { return this.#normalize().toReversed(); }
  }
  assert.deepEqual(new Reversed(new Set([1, 2, 3, 2, 1])).asReversed(), [3, 2, 1]);
});

// --- static init blocks ---

QUnit.test('static block: polyfilled init, class exposes public static result', assert => {
  class Snapshot {
    static data;
    static {
      // Array.from polyfill runs at class-evaluation time inside static-init block
      this.data = Array.from(new Set([10, 20, 10, 30, 20]));
    }
  }
  assert.deepEqual(Snapshot.data, [10, 20, 30]);
});

QUnit.test('static block: private static field populated via polyfilled Map', assert => {
  class Config {
    static #entries;
    static {
      this.#entries = new Map();
      this.#entries.set('lang', 'en');
      this.#entries.set('tz', 'UTC');
    }
    static get(key) { return Config.#entries.get(key); }
    static keys() { return Array.from(Config.#entries.keys()); }
  }
  assert.same(Config.get('lang'), 'en');
  assert.same(Config.get('tz'), 'UTC');
  assert.deepEqual(Config.keys().toSorted(), ['lang', 'tz']);
});

QUnit.test('static block: multiple blocks share state via private static', assert => {
  class Build {
    static #steps = [];
    static { this.#steps.push(...Array.from([1, 2])); }
    static { this.#steps.push(...Array.from(new Set([3, 3, 4]))); }
    static trace() { return Array.from(this.#steps); }
  }
  assert.deepEqual(Build.trace(), [1, 2, 3, 4]);
});

// --- private + inheritance + super ---

QUnit.test('private fields: subclass private shadows base private (distinct storage)', assert => {
  class Base {
    #tag = 'base';
    #data = Array.from([0]);
    describe() { return `${ this.#tag }:${ this.#data.at(-1) }`; }
  }
  class Child extends Base {
    #tag = 'child';
    #data = Array.from([1, 2, 3]);
    show() { return `${ this.#tag }:${ this.#data.at(-1) }`; }
  }
  const c = new Child();
  assert.same(c.describe(), 'base:0');
  assert.same(c.show(), 'child:3');
});

QUnit.test('static block + extends polyfilled receiver: super.from inside static init', assert => {
  class MyArr extends Array {
    static snapshot;
    static {
      // polyfill resolves `super.from(x)` to Array.from via super-class walking;
      // runs inside static-init block context
      this.snapshot = super.from(new Set([1, 1, 2, 3]));
    }
  }
  assert.true(MyArr.snapshot instanceof Array);
  assert.deepEqual([...MyArr.snapshot], [1, 2, 3]);
});

// --- private + polyfill via chaining ---

QUnit.test('private fields + optional chain: `?.` on #field member call', assert => {
  class Maybe {
    #box = null;
    set(xs) { this.#box = Array.from(xs); }
    firstOrNull() { return this.#box?.at(0) ?? null; }
  }
  const m = new Maybe();
  assert.same(m.firstOrNull(), null);
  m.set([42, 43]);
  assert.same(m.firstOrNull(), 42);
});

QUnit.test('private method + for-of with Map polyfill', assert => {
  class Merger {
    #combine(a, b) {
      const out = new Map();
      for (const [k, v] of a) out.set(k, v);
      for (const [k, v] of b) out.set(k, (out.get(k) ?? 0) + v);
      return out;
    }
    merge(a, b) { return Array.from(this.#combine(a, b)); }
  }
  const result = new Merger().merge(
    new Map([['x', 1], ['y', 2]]),
    new Map([['y', 3], ['z', 4]]),
  );
  // Map iteration preserves insertion order
  assert.deepEqual(result, [['x', 1], ['y', 5], ['z', 4]]);
});
