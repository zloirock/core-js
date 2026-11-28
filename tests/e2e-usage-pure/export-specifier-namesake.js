// a binding named like a global and handed out through an export specifier is this module's own value,
// so the realm constructor read beside it takes its narrow entry, which still constructs
const Promise = { local: true };
export { Promise };

QUnit.test('export specifier: a global namesake stays local while the realm constructor runs', assert => {
  assert.true(Promise.local);
  return new globalThis.Promise(resolve => resolve(7)).then(value => {
    assert.same(value, 7);
  });
});
