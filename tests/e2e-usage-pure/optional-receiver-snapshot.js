/* global fcOptionalReceiver -- global accessor deliberately read through an unbound name */

QUnit.test('optional receiver captures an unbound accessor before its null test', assert => {
  let reads = 0;
  Object.defineProperty(globalThis, 'fcOptionalReceiver', {
    configurable: true,
    get() { return [++reads === 1 ? 'held' : 'swapped']; },
  });
  try {
    assert.same(fcOptionalReceiver?.at(0), 'held');
    assert.same(reads, 1);
    reads = 0;
    assert.same(fcOptionalReceiver?.at?.(0), 'held');
    assert.same(reads, 1);
    reads = 0;
    // eslint-disable-next-line no-unsafe-optional-chaining -- the accessor always returns an array
    assert.same((fcOptionalReceiver?.at)(0), 'held');
    assert.same(reads, 1);
    reads = 0;
    const method = fcOptionalReceiver?.at;
    assert.same(method.call(['value'], 0), 'value');
    assert.same(reads, 1);
  } finally {
    delete globalThis.fcOptionalReceiver;
  }
});
