QUnit.test('Object.values', assert => {
  const { values, create, assign } = core.Object;
  assert.isFunction(values);
  assert.arity(values, 1);
  if ('name' in values) assert.name(values, 'values');
  assert.deepEqual(values({ q: 1, w: 2, e: 3 }), [1, 2, 3]);
  assert.deepEqual(values(new String('qwe')), ['q', 'w', 'e']);
  assert.deepEqual(values(assign(create({ q: 1, w: 2, e: 3 }), { a: 4, s: 5, d: 6 })), [4, 5, 6]);
  try {
    assert.deepEqual(Function('values', `
      return values({ a: 1, get b() {
        delete this.c;
        return 2;
      }, c: 3 });
   `)(values), [1, 2]);
  } catch (e) { /* empty */ }
  try {
    assert.deepEqual(Function('values', `
      return values({ a: 1, get b() {
        Object.defineProperty(this, "c", {
          value: 4,
          enumerable: false
        });
        return 2;
      }, c: 3 });
    `)(values), [1, 2]);
  } catch (e) { /* empty */ }
});
