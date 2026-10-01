// A plain array literal gives the paired claim its element value. A proxy-global element reads
// the substituted root; an opaque getter hop keeps the returned value's type, including the
// string instance family for `at`. The literal's own `at` value needs no polyfill.
const proxyRoot = (function () {
  const [{ Array: { from } }] = [globalThis];
  return from;
})();
const opaqueHopOwnName = (function () {
  const box = { get Array() { return { prototype: { at: 1 } }; } };
  const [{ Array: { prototype: { at } } }] = [box];
  return at;
})();
const opaqueHopTyped = (function () {
  const box = { get Array() { return { prototype: 'ab' }; } };
  const [{ Array: { prototype: { at } } }] = [box];
  return at;
})();
export { proxyRoot, opaqueHopOwnName, opaqueHopTyped };
