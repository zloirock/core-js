QUnit.test('Object.preventExtensions', assert => {
  const { preventExtensions, keys, getOwnPropertyNames, getOwnPropertySymbols } = core.Object;
  const { ownKeys } = core.Reflect;
  assert.isFunction(preventExtensions);
  assert.arity(preventExtensions, 1);
  const data = [42, 'foo', false, null, undefined, {}];
  for (const value of data) {
    assert.ok((() => {
      try {
        preventExtensions(value);
        return true;
      } catch (e) { /* empty */ }
    })(), `accept ${ {}.toString.call(value).slice(8, -1) }`);
    assert.same(preventExtensions(value), value, `returns target on ${ {}.toString.call(value).slice(8, -1) }`);
  }
  const results = [];
  for (const key in preventExtensions({})) results.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(preventExtensions({})), []);
  assert.arrayEqual(getOwnPropertyNames(preventExtensions({})), []);
  assert.arrayEqual(getOwnPropertySymbols(preventExtensions({})), []);
  assert.arrayEqual(ownKeys(preventExtensions({})), []);
});
