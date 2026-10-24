// The provider treats lexical module this as the realm, including definition-time keys.
// Standalone post sees Babel's undefined alias instead of the original module this.
const testBeforeLowering = typeof E2E_DETECT_LOWERED === 'undefined' ? QUnit.test : QUnit.skip;

testBeforeLowering('definition keys: module this survives class and object method boundaries', assert => {
  const object = { [this.Symbol.iterator]() { return this; } };
  assert.same(object[Symbol.iterator](), object);

  class C {
    [this.Array.from([7])[0]]() { return this; }
    [this.Object.assign({}, { key: 'field' }).key] = 8;
  }
  const value = new C();
  assert.same(value[7](), value);
  assert.same(value.field, 8);
});
