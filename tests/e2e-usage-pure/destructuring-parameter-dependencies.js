// Babel erases parameter TDZ checks, but the receiver read still precedes the later argument binding.
// The differential also verifies the original ReferenceError before lowering.
// eslint-disable-next-line default-param-last -- the later parameter must initialize after the receiver getter
export function readLaterParameter(probe = () => later, { at } = { get at() { return probe(); } }, later) {
  return [at, later];
}

// eslint-disable-next-line default-param-last -- the getter writes before the later parameter initializes
export function writeLaterParameter(probe = () => later = 7, { at } = { get at() { return probe(); } }, later) {
  return [at, later];
}

// eslint-disable-next-line default-param-last, no-shadow -- the earlier closure shadows the moved binding
export function readShadowedMovedBinding(probe = (at => () => at)(7), { at }) {
  return [at.call([4], 0), probe()];
}

QUnit.test('parameter binding: a getter observes the later binding before initialization', assert => {
  assert.deepEqual(readLaterParameter(undefined, undefined, 9), [undefined, 9]);
  assert.deepEqual(writeLaterParameter(undefined, undefined, 9), [7, 9]);
});

QUnit.test('parameter binding: nested parameter shadows keep their own value', assert => {
  assert.deepEqual(readShadowedMovedBinding(undefined, [4]), [4, 7]);
});
