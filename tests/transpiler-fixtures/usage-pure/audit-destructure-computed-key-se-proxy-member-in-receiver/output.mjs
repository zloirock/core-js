import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Map from "@core-js/pure/actual/map/constructor";
const m = _flatMaybeArray([1, _Map]);
// a proxy-global member chain nested in a re-referenceable literal receiver: the copied-receiver
// substitution rewrites the whole-constructor member (`globalThis.Map` -> `_Map`), matching the in-place
// residual's visitor rewrite
const {
  [(eff(), 'flat')]: _unused
} = [1, _Map];