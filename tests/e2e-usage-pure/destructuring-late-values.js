QUnit.test('a selected parameter default supplies a static member before a later parameter', assert => {
  let flag = true;
  const own = { Object: { keys: { name: 'own' }, entries: value => [['own', value.x]] } };
  function read({ Object: { keys: { name }, entries } } = flag ? globalThis : own, after = name) {
    return [name, entries({ x: 3 }), after];
  }
  assert.deepEqual(read(), ['keys', [['x', 3]], 'keys']);
  flag = false;
  assert.deepEqual(read(), ['own', [['own', 3]], 'own']);
  flag = true;
  assert.deepEqual(read(own), ['own', [['own', 3]], 'own']);
});

QUnit.test('computed pattern reads precede the next key and retain one receiver', assert => {
  const effects = [];
  const values = [4, 5];
  Object.defineProperty(values, 'at', { value() { return 9; } });
  function source() {
    effects.push('source');
    return values;
  }
  const { [(effects.push('first'), 'at')]: method = function () { return 7; },
    [(effects.push(typeof method), 'includes')]: contains, length } = source();
  assert.deepEqual(effects, ['source', 'first', 'function']);
  assert.same(method.call(values, -1), 9);
  assert.same(contains.call(values, 4), true);
  assert.same(length, 2);
});
