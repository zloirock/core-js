// a TS cast around a container INIT must not keep the binding off the container registry: its slot
// writes would then be dropped at publish time and a polyfill would override the replacement the
// program installed. no globals are touched here - the container is local, so no restore is needed
QUnit.test('mutated-statics-ts: a cast container init keeps its slot writes visible', assert => {
  const holder = { k: Object } as { k: unknown };
  (holder as { k: unknown }).k = Map;
  const { k: { groupBy } } = holder as { k: typeof Map };
  assert.same(groupBy, Map.groupBy);
  // the clean cast twin still resolves through the cast, so the pairing is not vacuous
  const clean = { k: Object } as { k: typeof Object };
  const { k: { keys } } = clean;
  assert.deepEqual(keys({ a: 1 }), ['a']);
});
