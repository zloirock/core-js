import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map2 from "@core-js/pure/actual/map";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
// the REFUSED-alias guarded narrow renders for the SOLE-ASSIGNMENT host exactly as for the
// declarator host (`g = (se, M === _Map ? _Map$groupBy : M.groupBy)`) - the raw read off a
// claimed alias answered `undefined` where every engine with the ctor answers the member
let n = 0;
function t(c) {
  let M;
  if (c) M = _Map;
  let g;
  try {
    g = (n++, M === _Map ? _Map$groupBy : M.groupBy);
    return [typeof g, n];
  } catch (e) {
    return ['T', n];
  }
}
export const viaAssignment = [t(true), t(false)];

// a bare ctor ESCAPING into a container slot resolves to the NAMESPACE entry (statics
// included): the slot's readers bail by design, so the stored value must carry them itself.
// the logical-assignment spellings store the reference the same way
const w = {
  k: Object
};
w.k = _Map2;
export const viaSlotWrite = typeof w.k.groupBy;
const cl = {
  q: null
};
cl.q ||= _Promise;
export const viaLogicalWrite = typeof cl.q.try;

// the VALUE-CONSUMING assignment host preserves its native value - the RHS object - as a
// sequence tail; and a mutator-installed ctor argument steers to the namespace entry even
// through the rewritten `.call` dispatch spelling
let vg;
export const viaValueHost = (() => {
  let M;
  if (n === 0) M = _Map;
  const v = (vg = M === _Map ? _Map$groupBy : M.groupBy, M);
  return [typeof vg, v === M];
})();
const installed = [];
_pushMaybeArray(installed).call(installed, _Map2);
export const viaMutatorArg = typeof installed[0].groupBy;