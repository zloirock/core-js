/* eslint-disable no-extend-native, es/no-nonstandard-iterator-prototype-properties -- Mutation sources under test. */

// a prototype patch lands on the ponyfill prototype that routed instances actually use
QUnit.test('mutated-statics: prototype patch flows through routed instances', assert => {
  Iterator.prototype.customDrop = function () { return 'proto-patch'; };
  try {
    assert.same(Iterator.from([1].values()).customDrop(), 'proto-patch');
  } finally {
    delete Iterator.prototype.customDrop;
  }
});
