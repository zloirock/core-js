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
  assert.same(value, 7);
  assert.deepEqual(events, ['string']);

  const quiet = { value: 8 };
  // eslint-disable-next-line no-unused-vars -- retain static slots without requiring wrapper polyfills
  const { Array: { of }, value: other } = { ...quiet, Array };
  assert.same(other, 8);
});

QUnit.test('destructuring: a getter ahead of a spread or an unknown key keeps its prefix read', assert => {
  const events = [];
  const extra = {};
  const viaSpread = {
    get value() { events.push('spread'); return 0; },
    ...extra,
  };
  const { prototype: { at } } = (viaSpread.value, String);
  assert.same(at.call('ab', -1), 'b');
  const key = ['un', 'known'].join('');
  const viaKey = {
    get value() { events.push('key'); return 0; },
    [key]: 1,
  };
  const { prototype: { includes } } = (viaKey.value, Array);
  assert.true(includes.call([1], 1));
  assert.same(viaKey[key], 1);
  assert.deepEqual(events, ['spread', 'key']);
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
