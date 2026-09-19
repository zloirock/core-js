/* eslint-disable es/no-nonstandard-map-properties -- Mutation sources under test. */
QUnit.test('mutated-statics: or-shim on a missing key assigns and serves the shim', assert => {
  Map.customShimKey = Map.customShimKey || function () { return 'served'; };
  try {
    assert.same(Map.customShimKey(), 'served');
  } finally {
    delete Map.customShimKey;
  }
});
