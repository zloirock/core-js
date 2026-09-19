import { restoreProperty } from '../../helpers/restore-property.cjs';

// with NO slot mutation on the ctor, the nested-proxy destructure normalizes to a flat
// read off the routed constructor - the patch and the read share one object, so the
// patched static is visible through the destructured binding
QUnit.test('mutated-statics: nested-proxy destructure reads through the routed constructor', assert => {
  function patched() { return 'patched'; }
  const descriptor = Object.getOwnPropertyDescriptor(Iterator, 'zip');
  Iterator.zip = patched;
  try {
    const { Iterator: { zip: routedRead } } = globalThis;
    assert.same(routedRead, patched);
  } finally {
    restoreProperty(Iterator, 'zip', descriptor);
  }
});
