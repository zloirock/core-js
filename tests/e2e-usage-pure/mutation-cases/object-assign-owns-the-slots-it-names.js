
// `Object.assign` is the one call whose writes this file can name, so handing it a container does
// not blind every other slot: the keys it installs are recorded one by one, and a sibling slot
// keeps its substitution. before the fix the target escaped like an argument of any other call,
// and the wildcard beside the precise records blocked the whole container
QUnit.test('mutated-statics: Object.assign owns the slots it names', assert => {
  const box = { patched: null, live: [1, 2, 3] };
  Object.assign(box, { patched: () => 'ASSIGNED' });
  assert.same(box.patched(), 'ASSIGNED');
  // the sibling slot the call never names still resolves through the polyfill
  assert.same(box.live.at(-1), 3);
});
