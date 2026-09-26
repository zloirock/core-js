// over a plain array LITERAL the pairing OWNS the element: the claim resolves through the value the
// element names, so the slot-rename route stands down and no minted name appears in any row. the
// sides of that: a PROXY-GLOBAL element, whose claim reads the substituted root, and an OPAQUE hop
// through a getter, whose claim reads the literal that getter returns - once where that literal
// carries the name itself and pulls nothing, once where it is a STRING and `at` says which family
// answered, which is what a lost type would show as the generic dispatcher
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
