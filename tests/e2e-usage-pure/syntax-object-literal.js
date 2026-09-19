import PureWeakSet from '@core-js/pure/actual/weak-set/constructor';

// Object literals, coercion and declaration-destructure around polyfill injection. Every test is
// DISTINGUISHING via evaluation count or order: a getter / computed key / spread source / iterator
// protocol must run an exact number of times, a declaration destructure must extract the polyfill
// while evaluating its receiver effect once, and Array.from must pull a custom iterator once per
// element. A literal that merely stores a polyfill RESULT would pass regardless, so those are absent.

// --- Accessors: evaluated exactly once on access ---

QUnit.test('object: getter returning a polyfill runs once per read', assert => {
  let calls = 0;
  const obj = {
    get last() {
      calls += 1;
      return [1, 2, 3].at(-1);
    },
  };
  assert.same(obj.last, 3);
  assert.same(calls, 1);
  assert.same(obj.last, 3);
  assert.same(calls, 2);
});

QUnit.test('object: setter consuming a polyfill runs once per write', assert => {
  let received;
  let calls = 0;
  const obj = {
    set value(v) {
      calls += 1;
      received = Array.from(v);
    },
  };
  obj.value = 'ab';
  assert.deepEqual(received, ['a', 'b']);
  assert.same(calls, 1);
});

QUnit.test('object: getter building via a polyfill is not invoked until read', assert => {
  let calls = 0;
  const obj = {
    get pairs() {
      calls += 1;
      return Object.fromEntries([['a', 1]]);
    },
  };
  assert.same(calls, 0);
  assert.deepEqual(obj.pairs, { a: 1 });
  assert.same(calls, 1);
});

// --- Computed keys: key expressions evaluate left to right, once each ---

QUnit.test('object: computed keys evaluate in source order around polyfill values', assert => {
  const order = [];
  function key(name) {
    order.push(name);
    return name;
  }
  const obj = {
    [key('a')]: Array.of(1).at(0),
    [key('b')]: Array.of(2).at(0),
  };
  assert.deepEqual(obj, { a: 1, b: 2 });
  assert.deepEqual(order, ['a', 'b']);
});

QUnit.test('object: computed key whose value is a polyfill is evaluated once', assert => {
  let calls = 0;
  function make() {
    calls += 1;
    return Array.from('xy');
  }
  const k = 'list';
  const obj = { [k]: make() };
  assert.deepEqual(obj[k], ['x', 'y']);
  assert.same(calls, 1);
});

// --- Spread: the spread source (and its polyfill) is evaluated once ---

QUnit.test('object: spread source feeding a polyfill is evaluated once', assert => {
  let calls = 0;
  function src() {
    calls += 1;
    return Object.fromEntries([['a', 1], ['b', 2]]);
  }
  const merged = { ...src(), c: 3 };
  assert.deepEqual(merged, { a: 1, b: 2, c: 3 });
  assert.same(calls, 1);
});

QUnit.test('object: spread precedence - later own key overrides a spread polyfill key', assert => {
  const merged = { ...Object.fromEntries([['x', 1], ['y', 2]]), y: 99 };
  assert.deepEqual(merged, { x: 1, y: 99 });
});

QUnit.test('object: rest after a polyfilled own key excludes it', assert => {
  const { a, ...rest } = { a: Array.of(1).at(0), b: 2, c: 3 };
  assert.same(a, 1);
  assert.deepEqual(rest, { b: 2, c: 3 });
});

// --- Symbol.iterator: core-js Array.from pulls a custom iterator once per element ---
// (object->primitive coercion via valueOf / Symbol.toPrimitive is NOT covered: that dispatch is
//  native ToNumber, which a pure polyfill cannot intercept - the polyfill only sees the result)

QUnit.test('object: Array.from pulls a custom Symbol.iterator once per element', assert => {
  let pulls = 0;
  const iterable = {
    [Symbol.iterator]() {
      let i = 0;
      return {
        next: () => i < 3
          ? { value: (pulls += 1, i++), done: false }
          : { value: undefined, done: true },
      };
    },
  };
  assert.deepEqual(Array.from(iterable), [0, 1, 2]);
  assert.same(pulls, 3);
});

QUnit.test('object: Array.from drives a generator-based iterable once per element', assert => {
  let pulls = 0;
  const iterable = {
    * [Symbol.iterator]() {
      for (let i = 0; i < 3; i += 1) {
        pulls += 1;
        yield i * 2;
      }
    },
  };
  assert.deepEqual(Array.from(iterable), [0, 2, 4]);
  assert.same(pulls, 3);
});

// --- Methods: shorthand and computed-name methods invoked the expected number of times ---

QUnit.test('object: shorthand method returning a polyfill runs once per call', assert => {
  let calls = 0;
  const api = {
    build() {
      calls += 1;
      return Array.of(1, 2, 3).toReversed();
    },
  };
  assert.deepEqual(api.build(), [3, 2, 1]);
  assert.same(calls, 1);
});

QUnit.test('object: computed-name method polyfills its body', assert => {
  const name = 'group';
  const api = {
    [name](items) {
      return Object.groupBy(items, x => x % 2 ? 'odd' : 'even');
    },
  };
  const grouped = api.group([1, 2, 3, 4]);
  assert.deepEqual(grouped.odd, [1, 3]);
  assert.deepEqual(grouped.even, [2, 4]);
});

QUnit.test('object: shorthand method returns a polyfilled combinator promise', assert => {
  const async = assert.async();
  const api = {
    all(values) {
      return Promise.all(values.map(v => Promise.resolve(v)));
    },
  };
  api.all([1, 2, 3]).then(r => {
    assert.deepEqual(r, [1, 2, 3]);
    async();
  });
});

// --- Declaration destructure (body-extract): receiver effect runs once, binding resolves ---

QUnit.test('object: declaration destructure receiver effect runs once', assert => {
  let calls = 0;
  const { of } = (calls += 1, Array);
  assert.deepEqual(of(1, 2), [1, 2]);
  assert.same(calls, 1);
});

QUnit.test('object: multi-declarator destructure resolves each polyfill once', assert => {
  let aCalls = 0;
  let bCalls = 0;
  const { from } = (aCalls += 1, Array);
  const { fromEntries } = (bCalls += 1, Object);
  assert.deepEqual(from('ab'), ['a', 'b']);
  assert.deepEqual(fromEntries([['k', 1]]), { k: 1 });
  assert.same(aCalls, 1);
  assert.same(bCalls, 1);
});

QUnit.test('object: nested destructure default builds via a polyfill only when absent', assert => {
  let calls = 0;
  const { a: { b = (calls += 1, Array.from('xyz')) } = {} } = { a: {} };
  assert.deepEqual(b, ['x', 'y', 'z']);
  assert.same(calls, 1);
  const { a: { b: b2 = (calls += 1, Array.from('xyz')) } = {} } = { a: { b: [0] } };
  assert.deepEqual(b2, [0]);
  assert.same(calls, 1);
});

// --- Computed member access feeding a polyfill: the key expression runs once ---

QUnit.test('object: computed member key feeding a chained polyfill runs once', assert => {
  let calls = 0;
  const store = { rows: [10, 20, 30] };
  function key() {
    calls += 1;
    return 'rows';
  }
  assert.same(store[key()].at(-1), 30);
  assert.same(calls, 1);
});

QUnit.test('object: accessor result chained into a polyfill keeps its receiver', assert => {
  const obj = {
    get nums() {
      return [[1], [2], [3]];
    },
  };
  assert.same(obj.nums.flat().at(-1), 3);
});

QUnit.test('object: polyfill result stored then read back through the literal', assert => {
  // eslint-disable-next-line unicorn/no-duplicate-set-values -- testing
  const wrap = { data: Array.from(new Set([1, 1, 2, 3])) };
  assert.deepEqual(wrap.data, [1, 2, 3]);
  assert.same(wrap.data.at(-1), 3);
});

/* eslint-disable unicorn/no-unused-properties -- computed slot regression shapes */
QUnit.test('destructure: an unknown later key preserves the selected receiver', assert => {
  function read(key, replacement) {
    const ns = { Q: Array, [key]: replacement };
    const { Q: { of: method } } = ns;
    return method;
  }
  assert.deepEqual(read('other', Map)(3, 7), [3, 7]);
  assert.same(read('Q', Map), undefined);
  function custom() { return 42; }
  assert.same(read('Q', { of: custom }), custom);
  assert.throws(() => read('Q', null), TypeError);
});

QUnit.test('destructure: a trailing spread preserves the selected receiver', assert => {
  function read(extra) {
    const ns = { Q: Array, ...extra };
    const { Q: { of: method } } = ns;
    return method;
  }
  assert.deepEqual(read({})(4, 9), [4, 9]);
  assert.same(read({ Q: Map }), undefined);
  function custom() { return 23; }
  assert.same(read({ Q: { of: custom } }), custom);
  assert.throws(() => read({ Q: null }), TypeError);
});

QUnit.test('destructure: an uncertain nested assignment keeps its receiver', assert => {
  function read(key, replacement) {
    const ns = { Q: Array, [key]: replacement };
    let method;
    // eslint-disable-next-line prefer-const -- assignment-form destructuring is the regression shape
    ({ Q: { of: method } } = ns);
    return method;
  }
  assert.deepEqual(read('other', Map)(5, 8), [5, 8]);
  assert.same(read('Q', Map), undefined);
  function custom() { return 31; }
  assert.same(read('Q', { of: custom }), custom);
  assert.throws(() => read('Q', null), TypeError);
});

QUnit.test('destructure: uncertain nested slots keep multiple static reads in order', assert => {
  const log = [];
  function read(key, replacement) {
    const ns = { wrap: { Q: Array, [key]: replacement } };
    const { wrap: { Q: { of: ofMethod, from: fromMethod } } } = ns;
    return [ofMethod, fromMethod];
  }
  const normal = read('other', Map);
  assert.deepEqual(normal[0](1, 2), [1, 2]);
  assert.deepEqual(normal[1]([6, 7]), [6, 7]);
  const overridden = read('Q', {
    get of() { log.push('of'); return 11; },
    get from() { log.push('from'); return 22; },
  });
  assert.deepEqual(overridden, [11, 22]);
  assert.deepEqual(log, ['of', 'from']);
});

QUnit.test('destructure: a shadowed constructor name cannot select the wrong static', assert => {
  function read(key) {
    const ns = { Q: Array, [key]: Map };
    // The runtime comparator must name the realm's Array.
    return function capture(Array) {
      const { Q: { of: method } } = ns;
      return [method, Array];
    }(Map);
  }
  assert.deepEqual(read('other')[0](2, 5), [2, 5]);
  assert.same(read('Q')[0], undefined);
});

QUnit.test('destructure: a computed replacement supplies its own static candidate', assert => {
  function read(key) {
    const ns = { Q: Object, [key]: Array };
    const { Q: { of: method } } = ns;
    return method;
  }
  assert.same(read('other'), undefined);
  assert.deepEqual(read('Q')(8, 13), [8, 13]);
});

QUnit.test('destructure: a written slot uses a candidate only when its receiver matches', assert => {
  function read(replacement) {
    const ns = { Q: Array };
    ns.Q = replacement;
    const { Q: { of: method } } = ns;
    return method;
  }
  assert.deepEqual(read(Array)(3, 6), [3, 6]);
  assert.same(read(Map), undefined);
  function custom() { return 71; }
  assert.same(read({ of: custom }), custom);
  assert.throws(() => read(null), TypeError);
});

QUnit.test('destructure: a consumed assignment keeps its source value and ordered reads', assert => {
  const log = [];
  function read(key, replacement) {
    let ofMethod;
    let fromMethod;
    const source = { Q: Array, [key]: replacement };
    const result = { Q: { of: ofMethod, from: fromMethod } } = source;
    assert.same(result, source);
    return [ofMethod, fromMethod];
  }
  const normal = read('other', Map);
  assert.deepEqual(normal[0](1, 2), [1, 2]);
  assert.deepEqual(normal[1]([3, 4]), [3, 4]);
  const overridden = read('Q', {
    get of() { log.push('of'); return 11; },
    get from() { log.push('from'); return 22; },
  });
  assert.deepEqual(overridden, [11, 22]);
  assert.deepEqual(log, ['of', 'from']);
});

QUnit.test('destructure: an inline assignment source keeps its own polyfill reads', assert => {
  function read(key) {
    let method;
    const result = { Q: { of: method } } = { Q: Array, [key]: Map };
    return [method, result];
  }
  const normal = read('other');
  assert.deepEqual(normal[0](5, 6), [5, 6]);
  assert.same(normal[1].other, Map);
  const overridden = read('Q');
  assert.same(overridden[0], undefined);
  assert.same(overridden[1].Q, Map);
});
/* eslint-enable unicorn/no-unused-properties -- end of the source forms above */

QUnit.test('getter member read supplies the pure constructor after running the getter once', assert => {
  const order = [];
  const source = {
    get w() {
      const count = order.push('getter');
      order.push(count);
      return globalThis;
    },
  };
  const value = source.w.WeakSet;
  assert.same(value, PureWeakSet);
  assert.deepEqual(order, ['getter', 1]);
});

QUnit.test('getter member read keeps an overriding object and the native null error', assert => {
  const order = [];
  const custom = {};
  function read(key, replacement) {
    const source = {
      get w() { order.push('getter'); return globalThis; },
      [key]: replacement, // eslint-disable-line unicorn/no-unused-properties -- the dynamic override is the source behavior under test
    };
    return source.w.WeakSet;
  }
  assert.same(read('w', { WeakSet: custom }), custom);
  assert.deepEqual(order, []);
  assert.throws(() => read('w', null), TypeError);
  assert.deepEqual(order, []);
  assert.same(read('other', null), PureWeakSet);
  assert.deepEqual(order, ['getter']);
});

QUnit.test('destructuring: a nested getter retains its effect and supplies the pure constructor', assert => {
  const order = [];
  const { w: { WeakSet: value } } = {
    get w() {
      order.push('getter');
      return globalThis;
    },
  };
  assert.same(value, PureWeakSet);
  assert.deepEqual(order, ['getter']);
});

QUnit.test('destructuring: a retained getter keeps unrelated locals', assert => {
  const order = [];
  const { w: { WeakSet: value } } = {
    get w() {
      const local = order.push('local');
      order.push(local);
      return globalThis;
    },
  };
  assert.same(value, PureWeakSet);
  assert.deepEqual(order, ['local', 1]);
});

QUnit.test('destructuring: a getter effect can throw before initializing its binding', assert => {
  const order = [];
  let value = 'before';
  function mark() {
    order.push(value);
    throw new RangeError('getter');
  }
  assert.throws(() => {
    ({ w: { WeakSet: value } } = {
      get w() { mark(); return globalThis; },
    });
  }, RangeError);
  assert.same(value, 'before');
  assert.deepEqual(order, ['before']);
});

QUnit.test('destructuring: a getter-local realm name stays local', assert => {
  const custom = {};
  const { w: { WeakSet: value } } = {
    get w() {
      const globalThis = { WeakSet: custom }; // eslint-disable-line sonarjs/prefer-immediate-return -- local shadow is under test
      return globalThis;
    },
  };
  assert.same(value, custom);
});

QUnit.test('destructuring: an unknown later key can override the getter', assert => {
  const custom = {};
  const order = [];
  function read(key) {
    const { w: { WeakSet: value } } = {
      get w() { order.push('getter'); return globalThis; },
      [key]: { WeakSet: custom },
    };
    return value;
  }
  assert.same(read('w'), custom);
  assert.deepEqual(order, []);
});

QUnit.test('destructuring: a shared getter source keeps its returned object', assert => {
  const order = [];
  const source = {
    get w() { order.push('getter'); return globalThis; },
  };
  const { w: { WeakSet: value } } = source;
  assert.same(source.w, globalThis);
  assert.deepEqual(order, ['getter', 'getter']);
  assert.same(value, PureWeakSet);
});

QUnit.test('destructuring: a getter escaping through this keeps its returned object', assert => {
  let leaked;
  const { w: { WeakSet: value } } = {
    get w() { leaked = this; return globalThis; },
  };
  assert.same(leaked.w, globalThis);
  assert.same(value, PureWeakSet);
});
