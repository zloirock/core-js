// an SE-bearing chain-root CALL on a MULTI-hop proxy receiver whose VALUE is discarded (every key resolves
// to a synth-swapped polyfill): the drop must re-emit ONLY the harvested call, not the verbatim `.self` /
// `.window` hop - re-emitting reads an undefined intermediate proxy hop off-browser (ie:11 / Node, where
// globalThis.self is undefined) and throws. the drop predicate keys on the multi-hop SHAPE (the caller has
// already confirmed the chain-root-call rescue); the prior folded-SE-length gate wrongly re-excluded a
// chain-root-call receiver, keeping the hop verbatim - babel kept raw `.self` -> throw, unplugin re-rooted
// `_self` + an extra import (import-parity break). covers param-default + per-branch conditional defaults
function eff() {}
function f({ from } = (() => {
  eff();
  return globalThis;
})().self.Array) {
  return from([1]);
}
const cond = true;
function g({ of } = cond ? (() => {
  eff();
  return globalThis;
})().window.Array : Set) {
  return of(1);
}
export { f, g };
