// Proxy hops anchor on the innermost proxy ponyfill, with a symbol slot beside the static.
// A branch mirror carries that symbol through a computed slot; an unmirrored hop keeps its read.
// A selection whose every arm is the realm collapses, while a test keeps its foreign arm.
/* eslint-disable no-restricted-globals, unicorn/prefer-global-this -- the bare proxy names are the shape under test */
const { self: { Map: { groupBy: viaSelf }, Symbol: { [Symbol.iterator]: iterateSelf } } } = window ?? globalThis;
const { globalThis: { Map: { groupBy: viaRealm }, Symbol: { [Symbol.iterator]: iterateRealm } } } = window ?? globalThis;
export function pickedArm(c) {
  const { self: { Map: { groupBy: armSelf }, Symbol: { [Symbol.iterator]: iterateArm } } } = c ? globalThis : {};
  return [armSelf, iterateArm];
}
export { viaSelf, iterateSelf, viaRealm, iterateRealm };
