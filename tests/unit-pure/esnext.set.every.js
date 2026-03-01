import Set from 'core-js-pure/full/set';

QUnit.test('Set#every', assert => {
  const { every } = Set.prototype;

  assert.isFunction(every);
  assert.arity(every, 1);
  assert.name(every, 'every');
  assert.nonEnumerable(Set.prototype, 'every');

  const set = new Set([1]);
  const context = {};
  set.every(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 1, 'correct key in callback');
    assert.same(that, set, 'correct link to set in callback');
    assert.same(this, context, 'correct callback context');
  }, context);

  assert.true(new Set([1, 2, 3]).every(it => typeof it == 'number'));
  assert.false(new Set(['1', '2', '3']).every(it => typeof it == 'number'));
  assert.false(new Set([1, '2', 3]).every(it => typeof it == 'number'));
  assert.true(new Set().every(it => typeof it == 'number'));

  assert.throws(() => every.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call(null, () => { /* empty */ }), TypeError);
});
