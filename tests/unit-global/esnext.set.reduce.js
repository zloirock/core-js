QUnit.test('Set#reduce', assert => {
  const { reduce } = Set.prototype;

  assert.isFunction(reduce);
  assert.arity(reduce, 1);
  assert.name(reduce, 'reduce');
  assert.looksNative(reduce);
  assert.nonEnumerable(Set.prototype, 'reduce');

  const set = new Set([1]);
  const accumulator = {};
  set.reduce(function (memo, value, key, that) {
    assert.same(arguments.length, 4, 'correct number of callback arguments');
    assert.same(memo, accumulator, 'correct callback accumulator');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 1, 'correct index in callback');
    assert.same(that, set, 'correct link to set in callback');
  }, accumulator);

  assert.same(new Set([1, 2, 3]).reduce(((a, b) => a + b), 1), 7, 'works with initial accumulator');

  new Set([1, 2]).reduce((memo, value, key) => {
    assert.same(memo, 1, 'correct default accumulator');
    assert.same(value, 2, 'correct start value without initial accumulator');
    assert.same(key, 2, 'correct start index without initial accumulator');
  });

  assert.same(new Set([1, 2, 3]).reduce((a, b) => a + b), 6, 'works without initial accumulator');

  let values = '';
  let keys = '';
  new Set([1, 2, 3]).reduce((memo, value, key, s) => {
    s.delete(2);
    values += value;
    keys += key;
  }, 0);
  assert.same(values, '13', 'correct order #1');
  assert.same(keys, '13', 'correct order #2');

  assert.throws(() => reduce.call(new Map(), () => { /* empty */ }, 1), TypeError);
  assert.throws(() => reduce.call({}, () => { /* empty */ }, 1), TypeError);
  assert.throws(() => reduce.call([], () => { /* empty */ }, 1), TypeError);
  assert.throws(() => reduce.call(undefined, () => { /* empty */ }, 1), TypeError);
  assert.throws(() => reduce.call(null, () => { /* empty */ }, 1), TypeError);
});
