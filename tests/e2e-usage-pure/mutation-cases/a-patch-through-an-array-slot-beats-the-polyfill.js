import { restoreProperty } from '../../helpers/restore-property.cjs';

// an array literal is a static container on the WRITE side too: its slots are index-keyed members, so
// a patch THROUGH one names the same static the receiver walk reads. regression: only the read side
// saw the slot, and the polyfill silently overrode the replacement. the patch is restored right after
// the read - a live one would follow every later `Array.of` in this module
QUnit.test('mutated-statics: a patch through an array slot beats the polyfill', assert => {
  const originalOfDescriptor = Object.getOwnPropertyDescriptor(Array, 'of');

  const box = [Array];
  box[0].of = function patchedOf() { return 'PATCHED'; };
  try {
    const { 0: { of } } = box;
    assert.same(of(1, 2), 'PATCHED');
  } finally {
    restoreProperty(Array, 'of', originalOfDescriptor);
  }
  // the same slot with NO patch resolves its static, so the pairing is not vacuous
  const clean = [Object];
  const { 0: { keys } } = clean;
  assert.deepEqual(keys({ a: 1 }), ['a']);
});
