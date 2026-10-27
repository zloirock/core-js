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

QUnit.test('optional receiver keeps nested prefixes and its stored value', assert => {
  const log = [];
  let held;
  function prefix(name) {
    log.push(name);
  }
  function index() {
    log.push(held ? 'index-after-store' : 'index-before-store');
    return 0;
  }
  function read(value) {
    // eslint-disable-next-line @stylistic/no-extra-parens -- nested sequence is the tested receiver shape
    return (prefix('outer'), (prefix('inner'), held = value))?.at(index());
  }
  assert.same(read(['held']), 'held');
  assert.deepEqual(log, ['outer', 'inner', 'index-after-store']);
  log.length = 0;
  assert.same(read(null), undefined);
  assert.same(held, null);
  assert.deepEqual(log, ['outer', 'inner']);
});
