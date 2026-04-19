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
  const Sorted = Base => class extends Base {
    asSorted() { return this.items.toSorted(); }
    asReversed() { return this.items.toReversed(); }
  };
  class Basket {
    constructor(items) { this.items = Array.from(items); }
  }
  class SortedBasket extends Sorted(Basket) {}
  // Set dedupes [3,1,4,1,5] → {3,1,4,5}; Array.from preserves insertion order
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
  Base.tags = Array.from(new Set(['x', 'y', 'z', 'y']));
  class Child extends Base {}
  assert.same(Child.first(), 'x');
  assert.same(Child.tags.length, 3);
  assert.same(new Child().kind(), 'base');
});
