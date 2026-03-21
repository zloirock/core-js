// Polyfills inside class methods and constructors

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
