// a conditionally assigned alias proves nothing on its own, but an if/else whose EVERY arm assigns
// the name settles the position by itself: whichever way the test went the binding holds one of
// those writes and never the hoisted `undefined`, so a receiver-less rewrite drops no access that
// would have thrown. the two arms are mutually exclusive, which is what makes a nested re-declaration
// readable at all - neither can overwrite the other. the negatives are the whole of what still
// proves nothing: an arm naming something other than the realm, a lone `if`, a name the arm itself
// SHADOWS (there the init reads that shadow, not the realm), and a write after the pair. one static
// per row, and none of them a name the instance dispatcher also answers - that channel would fire on
// the unknown receiver and hide whether the STATIC folded
export function bothArmsName(flag) {
  if (flag) { var G = globalThis; } else { var G = self; }
  return G.Array.from([2]);
}
export function bothArmsDestructure(flag) {
  if (flag) { var H = globalThis; } else { var H = self; }
  const { Object: { entries } } = H;
  return entries({ a: 1 });
}
// negatives
export function oneArmIsNotTheRealm(flag) {
  if (flag) { var N = globalThis; } else { var N = {}; }
  return N.Array.of(3);
}
export function noAlternate(flag) {
  if (flag) { var L = globalThis; }
  return L.Object.assign({}, { b: 2 });
}
export function armShadowsTheRealmName(flag) {
  if (flag) { const globalThis = {}; var S = globalThis; } else { var S = self; }
  return S.Object.getOwnPropertyNames({ c: 3 });
}
export function writtenAgainAfterThePair(flag) {
  if (flag) { var W = globalThis; } else { var W = self; }
  if (flag) W = {};
  return W.Object.freeze({ d: 4 });
}
