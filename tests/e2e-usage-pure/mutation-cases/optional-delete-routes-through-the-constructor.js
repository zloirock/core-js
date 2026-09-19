/* eslint-disable es/no-nonstandard-map-properties -- Mutation sources under test. */
// an optional-member delete is a mutation like any other: it routes through the same
// constructor object the reads use, so the pair stays consistent
QUnit.test('mutated-statics: optional delete routes through the constructor', assert => {
  Map.customOptDel = 7;
  assert.same(Map.customOptDel, 7);
  delete Map?.customOptDel;
  assert.false('customOptDel' in Map);
});
