import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// an SE-bearing chain-root CALL on a MULTI-hop proxy receiver whose VALUE is discarded (every key resolves
// to a synth-swapped polyfill): the drop must re-emit ONLY the harvested call, not the verbatim `.self` /
// `.window` hop - re-emitting reads an undefined intermediate proxy hop off-browser (ie:11 / Node, where
// globalThis.self is undefined) and throws. the drop predicate keys on the multi-hop SHAPE (the caller has
// already confirmed the chain-root-call rescue); the prior folded-SE-length gate wrongly re-excluded a
// chain-root-call receiver, keeping the hop verbatim - babel kept raw `.self` -> throw, unplugin re-rooted
// `_self` + an extra import (import-parity break). covers param-default + per-branch conditional defaults
function eff() {}
function f({
  from
} = ((() => {
  eff();
  return _globalThis;
})(), {
  from: _Array$from
})) {
  return from([1]);
}
const cond = true;
function g({
  of
} = cond ? ((() => {
  eff();
  return _globalThis;
})(), {
  of: _Array$of
}) : _Set) {
  return of(1);
}
export { f, g };