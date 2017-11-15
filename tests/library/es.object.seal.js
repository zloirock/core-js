QUnit.test('Object.seal', assert => {
  const { seal, keys, getOwnPropertyNames, getOwnPropertySymbols } = core.Object;
  const { ownKeys } = core.Reflect;
  assert.isFunction(seal);
  assert.arity(seal, 1);
  const data = [42, 'foo', false, null, undefined, {}];
  for (const value of data) {
    assert.ok((() => {
      try {
        seal(value);
        return true;
      } catch (e) { /* empty */ }
    })(), `accept ${ {}.toString.call(value).slice(8, -1) }`);
    assert.same(seal(value), value, `returns target on ${ {}.toString.call(value).slice(8, -1) }`);
  }
  const results = [];
  for (const key in seal({})) results.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(seal({})), []);
  assert.arrayEqual(getOwnPropertyNames(seal({})), []);
  assert.arrayEqual(getOwnPropertySymbols(seal({})), []);
  assert.arrayEqual(ownKeys(seal({})), []);
});
