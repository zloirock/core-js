// A declined parameter rewrite preserves native missing properties and author-written defaults.
// A post pass can guard the lowered member read by receiver identity.
const expectedFrom = typeof E2E_POST_LOWERED === 'undefined'
  ? Object.getOwnPropertyDescriptor(Array, 'from')?.value : Array.from;
const nativeOf = Object.getOwnPropertyDescriptor(Array, 'of')?.value;
const nativeSet = Object.getOwnPropertyDescriptor(globalThis, 'Set')?.value;

QUnit.test('parameter rest: no synthesized leaf defaults', assert => {
  const value = (({ from, ...rest } = Array) => [from, rest])();
  assert.same(value[0], expectedFrom);
  const mixed = (({ Set: Ctor, Array: { of }, ...rest } = globalThis) => [Ctor, of, rest])();
  assert.same(mixed[0], nativeSet);
  assert.same(mixed[1], nativeOf);
});

QUnit.test('parameter rest: the original leaf default remains live', assert => {
  let calls = 0;
  const value = (({ from = (calls++, 'own'), ...rest } = Array) => [from, rest])();
  assert.same(value[0], expectedFrom === undefined ? 'own' : expectedFrom);
  assert.same(calls, expectedFrom === undefined ? 1 : 0);
});

QUnit.test('parameter rest: supplied undefined and custom values stay intact', assert => {
  function read({ from = 'own', ...rest } = Array) { return [from, rest]; }
  assert.deepEqual(read({ from: undefined, extra: 7 }), ['own', { extra: 7 }]);
  assert.deepEqual(read({ from: 'custom', extra: 8 }), ['custom', { extra: 8 }]);
});
