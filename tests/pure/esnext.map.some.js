import Map from 'core-js-pure/full/map';

QUnit.test('Map#some', assert => {
  const { some } = Map.prototype;
  assert.isFunction(some);
  assert.arity(some, 1);
  assert.name(some, 'some');
  assert.nonEnumerable(Map.prototype, 'some');

  let map = new Map([[9, 1]]);
  const context = {};
  map.some(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 9, 'correct index in callback');
    assert.same(that, map, 'correct link to map in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  map = new Map([[0, 1], [1, '2'], [2, 3]]);
  assert.ok(map.some(it => typeof it === 'number'));
  assert.ok(map.some(it => it < 3));
  assert.ok(!map.some(it => it < 0));
  assert.ok(map.some(it => typeof it === 'string'));
  assert.ok(!map.some(function () {
    return +this !== 1;
  }, 1));
  let result = '';
  map.some((value, key) => {
    result += key;
    return false;
  });
  assert.same(result, '012');
  assert.ok(map.some((value, key, that) => that === map));

  assert.throws(() => some.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call(null, () => { /* empty */ }), TypeError);
});
