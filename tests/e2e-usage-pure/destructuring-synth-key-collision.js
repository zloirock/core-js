// Unknown parameter keys decline the mirror instead of overwriting an earlier read.
const expectedAt = typeof E2E_POST_LOWERED === 'undefined'
  ? Object.getOwnPropertyDescriptor(Array.prototype, 'at')?.value : Array.prototype.at;

QUnit.test('destructuring: a dynamic parameter key keeps the receiver native', assert => {
  function read(key, supplied) {
    return (function ({ at, [key]: alias } = [7]) {
      return [at, alias];
    })(supplied);
  }
  assert.same(read('at')[0], expectedAt);
  if (expectedAt) assert.same(read('at')[0].call([7], 0), 7);
  assert.same(read('length')[0], expectedAt);
  assert.same(read('length')[1], 1);
  assert.deepEqual(read('at', { at: 42 }), [42, 42]);
});

QUnit.test('destructuring: collision-safe mirrors preserve getter order', assert => {
  function read(key) {
    const log = [];
    const source = [];
    function method() { return 3; }
    Object.defineProperties(source, {
      at: {
        get() {
          log.push('at');
          return method;
        },
      },
      x: {
        get() {
          log.push('x');
          return 7;
        },
      },
    });
    const result = (function ({ at, [key]: alias } = source) {
      return [at, alias];
    })();
    return [result[0](), typeof result[1], log];
  }
  assert.deepEqual(read('x'), [3, 'number', ['at', 'x']]);
  assert.deepEqual(read('at'), [3, 'function', ['at', 'at']]);
});

QUnit.test('destructuring: mirror passthrough preserves an own proto key', assert => {
  function read(key) {
    return (function ({ at, [key]: proto } = [7]) {
      return [typeof at, proto];
    })();
  }
  assert.deepEqual(read('__proto__'), [typeof expectedAt, Array.prototype]);
});
