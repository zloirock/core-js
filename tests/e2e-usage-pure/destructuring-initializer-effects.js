/* eslint-disable prefer-const, no-unreachable-loop -- The declaration kinds and loop initializer are under test. */
QUnit.test('destructuring: discarded getters keep their source position', assert => {
  const events = [];
  function note(value) {
    events.push(value);
    return value;
  }
  const holder = { get box() {
    note('get');
    return { A: Array };
  } };
  const before = note('before'),
        { A: { from } } = holder.box,
        after = note('after');
  assert.deepEqual([before, from([7])[0], after], ['before', 7, 'after']);
  assert.deepEqual(events, ['before', 'get', 'after']);
  events.length = 0;
  for (const { A: { of } } = (note('prefix'), holder.box); ;) {
    assert.deepEqual(of(7), [7]);
    break;
  }
  assert.deepEqual(events, ['prefix', 'get']);
  events.length = 0;
  let isArray;
  if (holder) ({ A: { isArray } } = holder.box);
  assert.true(isArray([]));
  assert.deepEqual(events, ['get']);
});

QUnit.test('destructuring: reanchoring a pattern retains its getter', assert => {
  let reads = 0;
  const realm = { get value() {
    reads++;
    return globalThis;
  } };
  let custom;
  ({ Map: { custom } } = realm.value);
  assert.same(custom, undefined);
  assert.same(reads, 1);
});

QUnit.test('destructuring: a partial consume keeps the earlier declarator first', assert => {
  const events = [];
  function note(value) {
    events.push(value);
    return value;
  }
  const before = note('before'),
        { [(note('key'), 'Array')]: { from }, other } = (note('prefix'), globalThis),
        after = note('after');
  assert.deepEqual([before, from([7])[0], after, other], ['before', 7, 'after', undefined]);
  assert.deepEqual(events, ['before', 'prefix', 'key', 'after']);
});

QUnit.test('destructuring: retained prefix precedes the static binding', assert => {
  let seen;
  function observe() { seen = typeof isInteger; }
  // eslint-disable-next-line no-var -- var observes the old binding on lowered ES5 too.
  var { Number: { isInteger, ...numbers }, WeakMap: W } = (observe(), globalThis);
  assert.same(seen, 'undefined');
  assert.true(isInteger(7));
  assert.same(typeof W, 'function');
  assert.same(typeof numbers, 'object');
});
