import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
// a local Object / Reflect shadow silences only the BARE mutator callee (the local twin is not
// the global namespace) - a proxy-global chain, direct or aliased, names the REAL namespace, so
// its patch is recorded and the mutated static keeps the user override (routed through the
// injected constructor). the bare shadowed call is a plain local call: its target is NOT a
// recorded mutation, so the read still substitutes
const Object = {
  defineProperty() {}
};
const Reflect = {
  set() {}
};
_globalThis.Object.defineProperty(Array, 'from', {
  value: custom
});
const r1 = Array.from([1]);
const g = _globalThis;
g.Object.defineProperty(_Iterator, 'from', {
  value: custom2
});
const r2 = _Iterator.from(r1);
_Reflect$set(_Map, 'groupBy', custom3);
const r3 = _Map.groupBy(r2, fn);
Object.defineProperty(_Promise, 'try', {
  value: custom4
});
const r4 = _Promise$try(fn);