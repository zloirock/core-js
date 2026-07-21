QUnit.test('class: polyfill in constructor', assert => {
  class Collection {
    constructor(items) {
      this.items = Array.from(items);
    }
    has(item) {
      return this.items.includes(item);
    }
  }
  const c = new Collection([1, 2, 3]);
  assert.true(c.has(2));
  assert.false(c.has(4));
});

QUnit.test('class: polyfill in method', assert => {
  class Processor {
    process(arr) {
      return arr.filter(x => x > 0).map(x => x * 2);
    }
  }
  assert.deepEqual(new Processor().process([-1, 2, -3, 4]), [4, 8]);
});

QUnit.test('class: static method using polyfill', assert => {
  class Utils {
    static merge(...objects) {
      return Object.assign({}, ...objects);
    }
    describe() {
      return 'utils';
    }
  }
  assert.deepEqual(Utils.merge({ a: 1 }, { b: 2 }), { a: 1, b: 2 });
  assert.same(new Utils().describe(), 'utils');
});

QUnit.test('class: polyfill with inheritance', assert => {
  class Base {
    transform(arr) {
      return arr.toSorted();
    }
  }
  class Child extends Base {
    transform(arr) {
      return super.transform(arr).toReversed();
    }
  }
  assert.deepEqual(new Child().transform([2, 1, 3]), [3, 2, 1]);
});

QUnit.test('class: super.from in extends Array', assert => {
  class MyArray extends Array {
    static create(src) {
      return super.from(src);
    }
  }
  assert.deepEqual(MyArray.create([1, 2, 3]), [1, 2, 3]);
});

QUnit.test('class: computed own static member shadows this.<name>', assert => {
  const k = 'from';
  class C extends Array {
    static [k] = () => 'own';
    static run() {
      return this.from([1, 2, 3]);
    }
  }
  // `static [k]` (k === 'from') overrides the inherited Array.from, so this.from is the OWN member.
  // a polyfill that rewrote this.from to Array.from would return [1, 2, 3] instead of 'own'
  assert.same(C.run(), 'own');
});

QUnit.test('class: super.resolve in extends Promise', assert => {
  class MyPromise extends Promise {
    static resolveDouble(v) {
      return super.resolve(v * 2);
    }
  }
  const async = assert.async();
  MyPromise.resolveDouble(21).then(v => {
    assert.same(v, 42);
    async();
  });
});

// super.resolve / super.from in extends - covered by fixture tests only,
// @babel/transform-classes races with core-js plugin in bundled context

// --- Advanced class patterns ---

QUnit.test('class: mixin factory producing class with polyfilled methods', assert => {
  function Sorted(Base) {
    return class extends Base {
      asSorted() { return this.items.toSorted(); }
      asReversed() { return this.items.toReversed(); }
    };
  }
  class Basket {
    constructor(items) { this.items = Array.from(items); }
  }
  class SortedBasket extends Sorted(Basket) {}
  // Set dedupes [3,1,4,1,5] → {3,1,4,5}; Array.from preserves insertion order
  // eslint-disable-next-line unicorn/no-duplicate-set-values -- testing
  const b = new SortedBasket(new Set([3, 1, 4, 1, 5]));
  assert.deepEqual(b.asSorted(), [1, 3, 4, 5]);
  assert.deepEqual(b.asReversed(), [5, 4, 1, 3]);
});

QUnit.test('class: WeakMap-encapsulated polyfill in method', assert => {
  const cartItems = new WeakMap();
  class Cart {
    constructor(xs) { cartItems.set(this, Array.from(xs)); }
    withTax(rate) { return cartItems.get(this).map(p => p * (1 + rate)); }
    total(rate) { return this.withTax(rate).reduce((a, b) => a + b, 0); }
  }
  assert.same(new Cart([10, 20, 30]).total(0.1), 66);
});

QUnit.test('class: Set as instance prop, queried via public API', assert => {
  class UniqueTracker {
    constructor() { this.seen = new Set(); }
    add(x) {
      if (this.seen.has(x)) return false;
      this.seen.add(x);
      return true;
    }
    currentSize() { return this.seen.size; }
  }
  const t = new UniqueTracker();
  assert.true(t.add(1));
  assert.true(t.add(2));
  assert.false(t.add(1));
  assert.same(t.currentSize(), 2);
});

QUnit.test('class: Map init with Object.entries transform', assert => {
  class Config {
    constructor() { this.store = new Map(Object.entries({ a: 1, b: 2, c: 3 })); }
    get(k) { return this.store.get(k); }
    keys() { return Array.from(this.store.keys()).toSorted(); }
  }
  const c = new Config();
  assert.same(c.get('b'), 2);
  assert.deepEqual(c.keys(), ['a', 'b', 'c']);
});

QUnit.test('class: static method chain through polyfill helpers', assert => {
  class Stats {
    static dedupe(xs) { return Array.from(new Set(xs)); }
    static summary(xs) {
      const unique = Stats.dedupe(xs);
      return { count: unique.length, first: unique.at(0), last: unique.at(-1) };
    }
    instanceHook() { return Stats.dedupe([1, 1, 2]); }
  }
  assert.deepEqual(Stats.summary([3, 1, 2, 1, 3, 4]), { count: 4, first: 3, last: 4 });
  assert.deepEqual(new Stats().instanceHook(), [1, 2]);
});

QUnit.test('class: post-declaration static property assigned via polyfilled Set', assert => {
  class Registry {
    describe() { return 'registry'; }
    static has(name) { return Registry.instances.has(name); }
  }
  Registry.instances = new Set(Array.from({ length: 3 }, (_, i) => `inst-${ i }`));
  assert.true(Registry.has('inst-1'));
  assert.false(Registry.has('inst-5'));
  assert.same(new Registry().describe(), 'registry');
});

QUnit.test('class: post-declaration Map property pre-populated after class', assert => {
  class Translator {
    static translate(word) { return Translator.table.get(word) ?? word; }
    instanceRef() { return Translator.translate('hi'); }
  }
  Translator.table = new Map([['hi', 'hola'], ['bye', 'adios'], ['yes', 'si']]);
  assert.same(Translator.translate('hi'), 'hola');
  assert.same(Translator.translate('unknown'), 'unknown');
  assert.same(new Translator().instanceRef(), 'hola');
});

QUnit.test('class: sorted / reversed derived via polyfilled methods', assert => {
  class SortedList {
    constructor(xs) { this.items = Array.from(xs); }
    sorted() { return this.items.toSorted(); }
    reversed() { return this.items.toReversed(); }
  }
  const l = new SortedList([3, 1, 2]);
  assert.deepEqual(l.sorted(), [1, 2, 3]);
  assert.deepEqual(l.reversed(), [2, 1, 3]);
});

QUnit.test('class: setter-style API round-trip through Set/toSorted', assert => {
  class Bag {
    constructor() { this.itemsStore = []; }
    setItems(xs) { this.itemsStore = Array.from(new Set(xs)).toSorted(); }
    getItems() { return this.itemsStore; }
  }
  const b = new Bag();
  b.setItems([3, 1, 2, 1, 3]);
  assert.deepEqual(b.getItems(), [1, 2, 3]);
});

QUnit.test('class: child uses super method returning polyfill-built Array', assert => {
  class Base {
    protected() { return Array.from(new Set([1, 2, 3])).toSorted(); }
  }
  class Child extends Base {
    doubled() { return this.protected().map(x => x * 2); }
  }
  assert.deepEqual(new Child().doubled(), [2, 4, 6]);
});

QUnit.test('class: post-declaration static tags survive extends chain', assert => {
  class Base {
    kind() { return 'base'; }
    static first() { return Base.tags.at(0); }
  }
  // eslint-disable-next-line unicorn/no-duplicate-set-values -- testing
  Base.tags = Array.from(new Set(['x', 'y', 'z', 'y']));
  class Child extends Base {}
  assert.same(Child.first(), 'x');
  assert.same(Child.tags.length, 3);
  assert.same(new Child().kind(), 'base');
});

// optional super-method call must invoke the inherited method with `this === instance`, not
// `this === undefined` - the inherited method reads `this`, so a lost receiver would throw
QUnit.test('class: optional super-method call preserves this', assert => {
  class Base {
    data;
    getArr() { return this.data; }
  }
  class C extends Base {
    constructor() {
      super();
      this.data = [1, 2, 3];
    }
    m() { return super.getArr?.().at(0); }
  }
  assert.same(new C().m(), 1);
});

// non-poly STATIC-context super method (`super.custom`, the parent's own static - no polyfill) with
// >=2 trailing instance polys must combine into one guard like an instance super, calling the
// inherited static with `this === subclass constructor`. (was unplugin-only: the chain bailed to
// overlapping standalone transforms and crashed at compose time)
QUnit.test('class: non-poly static super + trailing instance polys combines', assert => {
  class Base {
    seed = [10, 20, 30];
    static custom() { return [10, 20, 30]; }
  }
  class C extends Base {
    static build() { return super.custom?.().map(x => x * 2).at(-1); }
  }
  assert.same(C.build(), 60);
  assert.deepEqual(new Base().seed, [10, 20, 30]);
  // optional short-circuit: a nullish super method skips the whole trailing chain
  class D extends Base {
    static build() { return super.missing?.().map(x => x).at(-1); }
  }
  assert.same(D.build(), undefined);
});

// `this.X?.()` in a static method of a subclass of Array is an inherited-static read: the
// polyfilled static is always defined, so the optional call deoptimizes to the injected
// static with `this` as receiver, and the TRAILING instance polys wrap its result. live
// oracle for the chain-combine handoff - a combine that keeps the raw method-GET drops the
// static injection (undefined on engines without native `Array.from`)
QUnit.test('class: optional inherited static with two trailing instance polyfills', assert => {
  class C extends Array {
    static make() {
      return this.from?.([[1], [2]]).flat().at(-1);
    }
  }
  assert.same(C.make(), 2);
});

// an OWN static shadowing the inherited name must keep dispatching to the user's method
// through the optional call - the polyfill machinery owns only the trailing instance methods
QUnit.test('class: optional call of own static shadowing an inherited name', assert => {
  class C extends Array {
    static from(x) {
      return [9].concat(x);
    }
    static make() {
      return this.from?.([1, 2]).flat().at(0);
    }
  }
  assert.same(C.make(), 9);
});

// an SE-prefixed computed key folding to an inherited static deopts the optional call: the
// key effect must run EXACTLY once ahead of the injected static (the overlapping-rewrite shape
// this locks against ran it twice and emitted unparsable text in the text emitter)
QUnit.test('class: SE-computed-key optional inherited static runs the key effect once', assert => {
  let effects = 0;
  class C extends Array {
    static make() {
      // eslint-disable-next-line @stylistic/no-extra-parens -- the parenthesized SE-prefixed key IS the case under test
      return this[(effects++, 'from')]?.([[1], [2]]).flat().at(-1);
    }
  }
  assert.same(C.make(), 2);
  assert.same(effects, 1);
});

// an OWN static shadowing the inherited name keeps the optional guard, so native short-circuit
// semantics survive a rebound `this`: the detached call must yield undefined, not throw on the
// missing method (the deopted shape called it unconditionally)
QUnit.test('class: shadowed inherited static keeps short-circuit under rebound this', assert => {
  class C extends Array {
    static from(x) {
      return [9, ...x];
    }
    static make() {
      return this.from?.([1, 2]).flat().at(0);
    }
  }
  assert.same(C.make(), 9);
  const detached = C.make;
  assert.same(detached.call({}), undefined);
});

// a method slot is writable: once `this.<m> = ...` installs a foreign function, the declared
// body's return type stops describing what a call yields. narrowing off that body picks an
// Array-specific helper, which delegates to a native String method the target may not have -
// the generic helper carries the string polyfill instead
QUnit.test('class: reassigned method slot keeps the generic dispatch', assert => {
  class Instance {
    rows() {
      return [1, 2];
    }
    swap() {
      this.rows = () => 'text';
    }
    read() {
      return this.rows().at(0);
    }
  }
  const inst = new Instance();
  assert.same(inst.read(), 1);
  inst.swap();
  assert.same(inst.read(), 't');
});

// the same slot on the STATIC side, written through the class binding rather than `this`
QUnit.test('class: static method slot written via the class binding stays generic', assert => {
  class Static {
    static list() {
      return [5, 6];
    }
    static swap() {
      Static.list = () => 'text';
    }
    static read() {
      return Static.list().at(1);
    }
    tag() {
      return 'instance';
    }
  }
  assert.same(new Static().tag(), 'instance');
  assert.same(Static.read(), 6);
  Static.swap();
  assert.same(Static.read(), 'e');
});
