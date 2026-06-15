import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map/constructor";
// a polyfillable `key in obj` folds to constant `true`, but a SequenceExpression receiver whose
// TAIL is itself side-effecting must still run that effect - the fold discards the tail's VALUE,
// not its effect. here the trailing `k = Map` assignment binds `k` even though the membership test
// collapses; the leading push runs (and is polyfilled, proving the rescued effect stays visitable),
// and the receiver `Map` reaches the proxy-global rewrite
let k;
const fx = [];
const r = (_pushMaybeArray(fx).call(fx, 1), k = _Map, true);
export { r, k };