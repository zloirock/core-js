import Map from 'core-js-pure/full/map';

QUnit.test('Map#reduce', assert => {
  const { reduce } = Map.prototype;

  assert.isFunction(reduce);
  assert.arity(reduce, 1);
  assert.name(reduce, 'reduce');
  assert.nonEnumerable(Map.prototype, 'reduce');

  const set = new Map([['a', 1]]);
  const accumulator = {};
  set.reduce(function (memo, value, key, that) {
    assert.same(arguments.length, 4, 'correct number of callback arguments');
    assert.same(memo, accumulator, 'correct callback accumulator');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 'a', 'correct index in callback');
    assert.same(that, set, 'correct link to set in callback');
  }, accumulator);

  assert.same(new Map([
    ['a', 1],
    ['b', 2],
    ['c', 3],
  ]).reduce(((a, b) => a + b), 1), 7, 'works with initial accumulator');

  new Map([
    ['a', 1],
    ['b', 2],
  ]).reduce((memo, value, key) => {
    assert.same(memo, 1, 'correct default accumulator');
    assert.same(value, 2, 'correct start value without initial accumulator');
    assert.same(key, 'b', 'correct start index without initial accumulator');
  });

  assert.same(new Map([
    ['a', 1],
    ['b', 2],
    ['c', 3],
  ]).reduce((a, b) => a + b), 6, 'works without initial accumulator');

  let values = '';
  let keys = '';
  new Map([
    ['a', 1],
    ['b', 2],
    ['c', 3],
  ]).reduce((memo, value, key, s) => {
    s.delete('b');
    values += value;
    keys += key;
  }, 0);
  assert.same(values, '13', 'correct order #1');
  assert.same(keys, 'ac', 'correct order #2');

  assert.throws(() => reduce.call({}, () => { /* empty */ }, 1), TypeError);
  assert.throws(() => reduce.call(undefined, () => { /* empty */ }, 1), TypeError);
  assert.throws(() => reduce.call(null, () => { /* empty */ }, 1), TypeError);
});
