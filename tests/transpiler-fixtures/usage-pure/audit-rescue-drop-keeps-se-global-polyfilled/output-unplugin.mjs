import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// dropping a multi-hop proxy rescue receiver must: (a) NOT orphan an inner global when the proxy chain
// sits ABOVE an SE sequence (`((se, globalThis).self).Array`) - the whole receiver is skipped, so a
// kept `globalThis` rewrite cannot race the drop; (b) still POLYFILL a global buried in the KEPT side
// effect (`Array.from(...)`), not skip it away with the dropped receiver value. covers the param-default
// and per-branch synth-swap drop paths. distinct methods so each injected import is unambiguous
let pushes = 0;
const log = [];
function withParamDefault({ of } = (pushes++, { of: _Array$of })) {
  return of;
}
const { from } = pushes ? { from: _Array$from } : ((_pushMaybeArray(log).call(log, _Array$from([1])), { from: _Array$from }));
export { withParamDefault, from };