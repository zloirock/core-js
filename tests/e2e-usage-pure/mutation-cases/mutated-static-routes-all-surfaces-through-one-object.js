
// a monkey-patched static routes every surface through one constructor object: the patch,
// the member read, the destructure extraction and the in-check all observe the same value
QUnit.test('mutated-statics: mutated static routes all surfaces through one object', assert => {
  const orig = Iterator.from;
  Iterator.from = function () { return 'patched'; };
  try {
    assert.same(Iterator.from(0), 'patched');
    const { from } = Iterator;
    assert.same(from(0), 'patched');
    assert.true('from' in Iterator);
  } finally {
    Iterator.from = orig;
  }
});
