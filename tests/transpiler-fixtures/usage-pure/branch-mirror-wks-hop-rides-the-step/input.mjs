// A well-known-symbol leaf has no slot the literal can spell, so its hop joins the step as a RAW
// passthrough of the hop's own read, and the step's whole-fit preflight has to model that route or
// it declines the step whose only spelling is the one it refused. The passthrough anchors on the
// innermost PROXY of its key path, through that proxy's own ponyfill: re-reading the step key by
// name off the root would walk the very name the ponyfill exists to supply. The step needs a branch
// worth swapping, which a TEST keeps: a selection every arm of which is the realm drops whole.
/* eslint-disable no-restricted-globals, unicorn/prefer-global-this -- the bare proxy names are the shape under test */
const { self: { Map: { groupBy: viaSelf }, Symbol: { [Symbol.iterator]: iterateSelf } } } = window ?? globalThis;
const { globalThis: { Map: { groupBy: viaRealm }, Symbol: { [Symbol.iterator]: iterateRealm } } } = window ?? globalThis;
export function pickedArm(c) {
  const { self: { Map: { groupBy: armSelf }, Symbol: { [Symbol.iterator]: iterateArm } } } = c ? globalThis : {};
  return [armSelf, iterateArm];
}
export { viaSelf, iterateSelf, viaRealm, iterateRealm };
