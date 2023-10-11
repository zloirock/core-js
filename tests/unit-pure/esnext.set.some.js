import Set from '@core-js/pure/full/set';

QUnit.test('Set#some', assert => {
  const { some } = Set.prototype;

  assert.isFunction(some);
  assert.arity(some, 1);
  assert.name(some, 'some');
  assert.nonEnumerable(Set.prototype, 'some');

  const set = new Set([1]);
  const context = {};
  set.some(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 1, 'correct key in callback');
    assert.same(that, set, 'correct link to set in callback');
    assert.same(this, context, 'correct callback context');
  }, context);

  assert.true(new Set([1, 2, 3]).some(it => typeof it == 'number'));
  assert.false(new Set(['1', '2', '3']).some(it => typeof it == 'number'));
  assert.true(new Set([1, '2', 3]).some(it => typeof it == 'number'));
  assert.false(new Set().some(it => typeof it == 'number'));

  assert.throws(() => some.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call(null, () => { /* empty */ }), TypeError);
});
