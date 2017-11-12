QUnit.test('Object.entries', function (assert) {
  var entries = core.Object.entries;
  var create = core.Object.create;
  var assign = core.Object.assign;
  assert.isFunction(entries);
  assert.arity(entries, 1);
  if ('name' in entries) {
    assert.name(entries, 'entries');
  }
  assert.deepEqual(entries({ q: 1, w: 2, e: 3 }), [['q', 1], ['w', 2], ['e', 3]]);
  assert.deepEqual(entries(new String('qwe')), [['0', 'q'], ['1', 'w'], ['2', 'e']]);
  assert.deepEqual(entries(assign(create({ q: 1, w: 2, e: 3 }), { a: 4, s: 5, d: 6 })), [['a', 4], ['s', 5], ['d', 6]]);
  try {
    assert.deepEqual(Function('return core.Object.entries({a: 1, get b(){delete this.c;return 2},c: 3})')(), [['a', 1], ['b', 2]]);
  } catch (e) { /* empty */ }
  try {
    assert.deepEqual(Function('return core.Object.entries({a: 1, get b(){Object.defineProperty(this, "c", {value:4,enumerable:false});return 2},c: 3})')(), [['a', 1], ['b', 2]]);
  } catch (e) { /* empty */ }
});
