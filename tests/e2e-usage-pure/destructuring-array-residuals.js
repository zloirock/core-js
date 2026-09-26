QUnit.test('destructuring: array consume plans remove only extracted reads', assert => {
  const log = [];
  function method() { return 7; }
  const source = {
    get at() { log.push('at'); return method; },
    get includes() { log.push('includes'); return method; },
    keep: 3,
  };
  const [{ at, includes, keep }] = [source];
  assert.deepEqual([at(), includes(), keep], [7, 7, 3]);
  assert.deepEqual(log, ['at', 'includes']);
});

QUnit.test('destructuring: array static sentinels retain rest exclusions', assert => {
  // eslint-disable-next-line no-useless-rename, @stylistic/quote-props -- retains the literal-key spelling under test
  const [{ 'from': from, ...rest }, tail] = [Array, 1];
  const [{ [Symbol.iterator]: iterator, of, ...remaining }] = [Array];
  assert.deepEqual(from([tail]), [1]);
  assert.deepEqual(of(2), [2]);
  assert.strictEqual(typeof iterator, 'undefined');
  assert.false(Object.hasOwn(rest, 'from'));
  assert.false(Object.hasOwn(remaining, 'of'));
});

QUnit.test('destructuring: nested array static rest retains effects and exclusions', assert => {
  const log = [];
  const [{ Object: { keys, ...rest } }] = [(log.push('init'), globalThis)];
  const [{ Object: { entries = log.push('default'), ...remaining } }, tail] = [globalThis, 1];
  assert.deepEqual(keys({ a: tail }), ['a']);
  assert.deepEqual(entries({ b: 2 }), [['b', 2]]);
  assert.deepEqual(log, ['init']);
  assert.false(Object.hasOwn(rest, 'keys'));
  assert.false(Object.hasOwn(remaining, 'entries'));
});

QUnit.test('destructuring: independent nested reads preserve repeated getters', assert => {
  const log = [];
  let count = 0;
  const source = {
    get w() {
      const value = ++count;
      log.push(value);
      return {
        get at() { log.push(`at${ value }`); return value; },
      };
    },
  };
  const [{ w: { at: first }, w: { at: second } }] = [source, log.push('tail')];
  assert.deepEqual([first, second], [1, 2]);
  assert.deepEqual(log, ['tail', 1, 'at1', 2, 'at2']);
});

QUnit.test('destructuring: array assignments retain static rest sources and stores', assert => {
  const log = [];
  let keys;
  let rest;
  let saved;
  // eslint-disable-next-line prefer-const -- the assignment pattern and initializer store are the tested hosts
  [{ Object: { keys }, ...rest }] = [saved = (log.push('source'), globalThis)];
  assert.deepEqual(keys({ a: 1 }), ['a']);
  assert.false(Object.hasOwn(rest, 'Object'));
  assert.same(saved, globalThis);
  assert.deepEqual(log, ['source']);
  let of;
  let remaining;
  let tail;
  // eslint-disable-next-line prefer-const -- the assignment pattern is the tested host
  [{ of, ...remaining }, tail] = [Array, 7];
  assert.deepEqual(of(tail), [7]);
  assert.false(Object.hasOwn(remaining, 'of'));
});
