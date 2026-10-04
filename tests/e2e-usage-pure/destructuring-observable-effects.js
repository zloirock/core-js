QUnit.test('destructuring: computed keys retain accessor effects before static extraction', assert => {
  const events = [];
  const key = {
    get value() { events.push('key'); return 0; },
  };
  const { [(key.value, 'from')]: from } = Array;
  assert.deepEqual(from([3, 4]), [3, 4]);
  assert.deepEqual(events, ['key']);

  let of;
  // eslint-disable-next-line prefer-const -- exercise the assignment host
  ({ [(key.value, 'of')]: of } = Array);
  assert.deepEqual(of(5), [5]);
  assert.deepEqual(events, ['key', 'key']);

  const quiet = { value: 0 };
  const { [(quiet.value, 'isArray')]: isArray } = Array;
  assert.same(isArray([]), true);
});

QUnit.test('destructuring: a computed symbol key keeps its accessor read once', assert => {
  const events = [];
  const key = {
    get value() { events.push('key'); return 0; },
  };
  let iterator;
  // eslint-disable-next-line prefer-const -- exercise the assignment host
  ({ [(key.value, Symbol.iterator)]: iterator } = [3, 4]);
  assert.same(iterator.call([3, 4]).next().value, 3);
  assert.deepEqual(events, ['key']);
});

QUnit.test('destructuring: spread getters run before the pattern writes its first binding', assert => {
  const events = [];
  const extra = {
    get value() { events.push(typeof from); return 7; },
  };
  let from = 'old';
  let value;
  ({ Array: { from }, value } = { ...extra, Array });
  assert.deepEqual(from([3, 4]), [3, 4]);
  assert.same(value, 7);
  assert.deepEqual(events, ['string']);

  const quiet = { value: 8 };
  const { Array: { of }, value: other } = { ...quiet, Array };
  assert.deepEqual(of(5), [5]);
  assert.same(other, 8);
});

QUnit.test('destructuring: discarded sequence tails keep receiver effects and both assignments', assert => {
  const events = [];
  function make() {
    events.push('make');
    return Array;
  }
  const target = {};
  let name;
  ({ from: target.method, name } = make());
  assert.deepEqual(target.method([2]), [2]);
  assert.same(typeof name, 'string');
  assert.deepEqual(events, ['make']);

  let from;
  // eslint-disable-next-line @stylistic/no-extra-parens -- exercise a discarded sequence tail
  (events.push('prefix'), ({ from } = make()));
  assert.deepEqual(from([3]), [3]);
  assert.deepEqual(events, ['make', 'prefix', 'make']);
});
