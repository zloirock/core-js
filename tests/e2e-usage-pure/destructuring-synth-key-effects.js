import { restoreProperty } from '../helpers/restore-property.cjs';

// Unknown parameter keys retain native reads; a post pass can polyfill the lowered named read.
const expectedAtType = typeof E2E_POST_LOWERED === 'undefined'
  ? typeof Object.getOwnPropertyDescriptor(Array.prototype, 'at')?.value : 'function';

QUnit.test('destructuring: a parameter preserves distinct reads of a coincident key', assert => {
  function read(key) {
    let reads = 0;
    const source = [];
    Object.defineProperty(source, 'at', {
      get() {
        return ++reads === 1 ? function () {
          return 1;
        } : function () {
          return 2;
        };
      },
    });
    const result = (function ({ at, [key]: alias } = source) {
      return [at(), alias()];
    })();
    return [result, reads];
  }
  assert.deepEqual(read('at'), [[1, 2], 2]);
});

QUnit.test('destructuring: a parameter coerces a dynamic key once', assert => {
  const log = [];
  const key = {
    toString() {
      log.push('key');
      return 'length';
    },
  };
  // eslint-disable-next-line unicorn/no-unsafe-property-key -- exercise observable ToPropertyKey
  const result = (function ({ at, [key]: alias } = [7]) {
    return [typeof at, alias];
  })();
  assert.deepEqual([result, log], [[expectedAtType, 1], ['key']]);
});

QUnit.test('destructuring: key coercion runs between the original property reads', assert => {
  const source = [];
  Object.defineProperty(source, 'at', { value() { return 1; }, configurable: true });
  const key = {
    toString() {
      Object.defineProperty(source, 'at', { value() { return 2; } });
      return 'at';
    },
  };
  // eslint-disable-next-line unicorn/no-unsafe-property-key -- exercise observable ToPropertyKey
  const result = (function ({ at, [key]: alias } = source) {
    return [at(), alias()];
  })();
  assert.deepEqual(result, [1, 2]);
});

QUnit.test('destructuring: nested object defaults coerce each key once', assert => {
  const log = [];
  const key = {
    toString() {
      log.push('key');
      return 'length';
    },
  };
  // eslint-disable-next-line unicorn/no-unsafe-property-key -- exercise observable ToPropertyKey
  function read({ value: { at, [key]: other } = [7] } = {}) {
    return [typeof at, other, log];
  }
  assert.deepEqual(read(), [expectedAtType, 1, ['key']]);
});

QUnit.test('destructuring: nested array defaults coerce each key once', assert => {
  const log = [];
  const key = {
    toString() {
      log.push('key');
      return 'length';
    },
  };
  // eslint-disable-next-line unicorn/no-unsafe-property-key -- exercise observable ToPropertyKey
  function read([{ at, [key]: other } = [7]] = []) {
    return [typeof at, other, log];
  }
  assert.deepEqual(read(), [expectedAtType, 1, ['key']]);
});

QUnit.test('destructuring: ordinary extraction keeps two independent reads', assert => {
  function read(key) {
    let reads = 0;
    const source = [];
    Object.defineProperty(source, 'at', {
      get() {
        const value = ++reads;
        return function () { return value; };
      },
    });
    const { at, [key]: other } = source;
    return [at(), other(), reads];
  }
  assert.deepEqual(read('at'), [1, 2, 2]);
});

QUnit.test('destructuring: repeated named parameter keys preserve each getter value', assert => {
  let reads = 0;
  const source = [];
  Object.defineProperty(source, 'at', {
    get() {
      const value = ++reads;
      return function () { return value; };
    },
  });
  const result = (function ({ at, at: other } = source) {
    return [at(), other()];
  })();
  assert.deepEqual([result, reads], [[1, 2], 2]);
});

QUnit.test('destructuring: ordinary extraction polyfills the named read beside an unknown key', assert => {
  function read(key) {
    const { at, [key]: other } = [7];
    return [at.call([7], 0), other];
  }
  assert.deepEqual(read('length'), [7, 1]);
});

QUnit.test('destructuring: an assignment evaluates its RHS before writing the first static sibling', assert => {
  const events = [];
  let from;
  let of = 'old';
  ({ of, [(events.push(['key', typeof of]), 'from')]: from } = (events.push(['rhs', of]), Array));
  assert.deepEqual(events, [['rhs', 'old'], ['key', 'function']]);
  assert.deepEqual([of(7), from([8])], [[7], [8]]);
  let quietFrom, quietOf;
  // eslint-disable-next-line prefer-const -- the quiet assignment is the control
  ({ of: quietOf, from: quietFrom } = Array);
  assert.deepEqual([quietOf(9), quietFrom([10])], [[9], [10]]);
});

QUnit.test('destructuring: a native sibling getter follows an effectful constructor key', assert => {
  const events = [];
  let reads = 0;
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'fc551Sibling');
  restoreProperty(globalThis, 'fc551Sibling', {
    configurable: true,
    get() {
      events.push('sibling');
      return ++reads;
    },
  });
  try {
    const { [(events.push('key'), 'Array')]: { from }, fc551Sibling: sibling } = globalThis;
    assert.deepEqual([from([11]), sibling, reads], [[11], 1, 1]);
    assert.deepEqual(events, ['key', 'sibling']);
    events.length = 0;
    const { Array: { of }, fc551Sibling: quietSibling } = globalThis;
    assert.deepEqual([of(12), quietSibling, reads], [[12], 2, 2]);
    assert.deepEqual(events, ['sibling']);
  } finally {
    restoreProperty(globalThis, 'fc551Sibling', previous);
  }
});

QUnit.test('destructuring: captured array statics keep a native read after their computed key', assert => {
  const events = [];
  // A fresh property can carry the getter even where function length is non-configurable.
  const previous = Object.getOwnPropertyDescriptor(Array, 'fc551Sibling');
  restoreProperty(Array, 'fc551Sibling', {
    configurable: true,
    get() {
      events.push('sibling');
      return 29;
    },
  });
  try {
    const { w: [{ of, [(events.push('key'), 'from')]: from, fc551Sibling: sibling }] } = { w: [(events.push('rhs'), Array)] };
    assert.deepEqual([of(7), from([8]), sibling], [[7], [8], 29]);
    assert.deepEqual(events, ['rhs', 'key', 'sibling']);
    events.length = 0;
    let pairedOf, pairedFrom, pairedSibling, tail;
    // eslint-disable-next-line prefer-const -- the paired assignment owns the captured positions
    [{ of: pairedOf, [(events.push('key'), 'from')]: pairedFrom, fc551Sibling: pairedSibling }, tail] =
      [(events.push('rhs'), Array), 31];
    assert.deepEqual([pairedOf(9), pairedFrom([10]), pairedSibling, tail], [[9], [10], 29, 31]);
    assert.deepEqual(events, ['rhs', 'key', 'sibling']);
  } finally {
    restoreProperty(Array, 'fc551Sibling', previous);
  }
});
