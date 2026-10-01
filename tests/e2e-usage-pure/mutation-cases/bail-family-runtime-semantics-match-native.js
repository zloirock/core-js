
// the remaining bail family at runtime: an optional receiver keeps NATIVE throw semantics when the
// chain is undefined, and a wholly-reassigned / conditionally-written / parameter-passed container
// reads what the program put there - the polyfill never overrides any of them
QUnit.test('mutated-statics: bail-family runtime semantics match native', assert => {
  const holeHost = {};
  assert.throws(() => {
    // eslint-disable-next-line no-unsafe-optional-chaining -- the native throw IS the case under test
    const { at } = holeHost.missing?.list;
    return at;
  }, TypeError);
  // the initial container value is intentionally dead - the reassignment IS the case under test
  // eslint-disable-next-line no-useless-assignment -- see above
  let swapped = { k: Array };
  swapped = { k: { of: () => 'SWAPPED' } };
  const { k: { of: fromSwapped } } = swapped;
  assert.same(fromSwapped(1), 'SWAPPED');
  const conditional = { k: Array };
  const always = true;
  if (always) conditional.k = { of: () => 'CONDITIONAL' };
  const { k: { of: fromConditional } } = conditional;
  assert.same(fromConditional(1), 'CONDITIONAL');
  const viaParam = (function (incoming) {
    const { k: { of } } = incoming;
    return of;
  })({ k: { of: () => 'PARAM' } });
  assert.same(viaParam(1), 'PARAM');
});
