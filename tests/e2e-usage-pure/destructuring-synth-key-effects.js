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
